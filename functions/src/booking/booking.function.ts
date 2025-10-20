import * as logger from "firebase-functions/logger";
import * as nodemailer from "nodemailer";

import { Request, Response } from "express";
import { onRequest } from "firebase-functions/v2/https";
import {
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  getFirestore,
  QuerySnapshot,
} from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

import {
  COLLECTIONS,
  ENV_KEYS,
  ENV_SECRETS,
  ERROR_MESSAGES,
} from "../shared/constants";
import { ResponseBody } from "../shared/models";
import { IProduct, IUser } from "../shared/interfaces";
import {
  extractJwt,
  parseBookingFormData,
  IBookingReq,
  GetAdminNotificationTemplate,
  generateJwt,
} from "../shared/utils";

import { IBooking, IBookingSlot } from "./booking.interface";
import { getBookingValidator, postBookingValidator } from "./booking.validator";

const BOOKING_SUB_URLS = {
  GET: {
    fromDate: "fromDate",
    preBooking: "pre-booking",
  },
  PUT: {
    preBookingConfirm: "pre-booking/confirm",
    bookingApprove: "approve",
  },
  POST: {},
};

const generalError = new ResponseBody(null, false, [ERROR_MESSAGES.GENERAL]);
const jwtError = new ResponseBody(null, false, [ERROR_MESSAGES.JWT]);

export const BookingFunction = onRequest(
  {
    secrets: [
      ENV_SECRETS.MAIL_PASS,
      ENV_SECRETS.MAIL_USER,
      ENV_SECRETS.JWT_SECRET,
    ],
    cors: [process.env[ENV_KEYS.UI_URL]!, process.env[ENV_KEYS.UI_URL_LOCAL]!],
  },
  async (req: Request, res: Response): Promise<void> => {
    /* eslint-disable indent */
    switch (req.method) {
      case "GET":
        return getBookingHandler(req, res);
      case "PUT":
        return putBookingHandler(req, res);
      case "POST":
        return postBookingHandler(req, res);
      case "DELETE":
        return deleteBookingHandler(req, res);
    }
    /* eslint-enable indent */
  }
);

async function getBookingHandler(req: Request, res: Response): Promise<any> {
  if (req.url.includes(BOOKING_SUB_URLS.GET.fromDate)) {
    const db = getFirestore();

    let productId = null;
    let fromDate = null;

    try {
      productId = req.query.productId;
      // @ts-ignore
      fromDate = +req.query.fromDate as number;
    } catch (e: unknown) {
      return res
        .status(400)
        .json(new ResponseBody(null, false, [ERROR_MESSAGES.BAD_DATA]));
    }

    const validationErrors = getBookingValidator({ productId, fromDate });
    if (validationErrors) {
      res.status(400).json(new ResponseBody(null, false, validationErrors));
      return;
    }

    // Commented out for development purposes
    // @ts-ignore
    // const endDate = new Date(fromDate);
    // endDate.setDate(endDate.getDate() + 14);
    // const querySnapshot: QuerySnapshot = await getFirestore().collection(COLLECTIONS.AVAILABLE_SLOTS).where('start', '>=', fromDate).where('start', '<=', endDate.valueOf()).get();

    const querySnapshot: QuerySnapshot = await db
      .collection(COLLECTIONS.AVAILABLE_SLOTS)
      .where("start", ">=", fromDate)
      .where("productId", "==", productId)
      .get();

    const docs: IBookingSlot[] = querySnapshot.docs.map(
      (doc: DocumentSnapshot) => ({ id: doc.id, ...doc.data() } as IBookingSlot)
    );

    logger.info(
      `[GET BOOKING] Retrieved ${docs.length} bookings starting with date: ${fromDate}`
    );

    return res.status(200).send(new ResponseBody(docs, true));
  }

  return res
    .status(404)
    .json(new ResponseBody(null, false, [ERROR_MESSAGES.NOT_EXIST]));
}

async function putBookingHandler(req: Request, res: Response): Promise<any> {
  const db = getFirestore();

  if (req.url.includes(BOOKING_SUB_URLS.PUT.preBookingConfirm)) {
    const jwtToken = extractJwt<{ preBookingId: string } | null>(
      req.query.token as string,
      process.env[ENV_SECRETS.JWT_SECRET] as string
    );

    if (!jwtToken) {
      res.status(401).json(jwtError);
      return;
    }

    let preBooking;
    try {
      preBooking = await db
        .collection(COLLECTIONS.PREBOOKINGS)
        .doc(jwtToken.preBookingId)
        .get();
    } catch (error: unknown) {
      return res.status(500).json(generalError);
    }

    preBooking.data()!.bookingSlots.forEach(async (slot: IBookingSlot) => {
      await db
        .collection(COLLECTIONS.AVAILABLE_SLOTS)
        .doc(slot.id)
        .update({ isPreBooked: true });
    });

    res.status(200).send(new ResponseBody({}, true));
  } else if (req.url.includes(BOOKING_SUB_URLS.PUT.bookingApprove)) {
    const jwtToken = extractJwt<{ id: string } | null>(
      req.query.token as string,
      process.env[ENV_SECRETS.JWT_SECRET] as string
    );

    if (!jwtToken) {
      res.status(401).json(jwtError);
      return;
    }

    let userDocumentData: DocumentData;
    try {
      userDocumentData = await db
        .collection(COLLECTIONS.USERS)
        .doc(jwtToken!.id)
        .get();
    } catch (e: any) {
      logger.error("[PUT BOOKING APPROVE] Querying DB by user ID failed", e);
      res.status(500).json(generalError);
      return;
    }

    if (!userDocumentData.exists) {
      res
        .status(400)
        .json(new ResponseBody(null, false, [ERROR_MESSAGES.NOT_FOUND]));
      return;
    }

    const user: IUser = userDocumentData.data() as IUser;

    if (!user.isAdmin) {
      res.status(401).json(jwtError);
      return;
    }

    const reqBody: unknown[] = req.body;

    reqBody.forEach((preBooking: any) => {
      preBooking.bookingSlots.forEach(async (bookingSlot: IBookingSlot) => {
        await db
          .collection(COLLECTIONS.AVAILABLE_SLOTS)
          .doc(bookingSlot.id)
          .update({
            isBooked: true,
            isPreBooked: false,
            bookedByEmail: preBooking.email,
          });
      });

      // todo success email send
    });
  }

  return res
    .status(404)
    .json(new ResponseBody(null, false, [ERROR_MESSAGES.NOT_EXIST]));
}

async function postBookingHandler(req: Request, res: Response): Promise<any> {
  const uiUrl = process.env[ENV_KEYS.UI_URL];
  const resetTokenExp = process.env[ENV_KEYS.RESET_TOKEN_EXP];
  const adminEmailAddress = process.env[ENV_SECRETS.ADMIN_MAIL]!;
  const jwtSecret = process.env[ENV_SECRETS.JWT_SECRET]!;

  const db = getFirestore();

  const jwtToken = extractJwt<{ [key: string]: string } | null>(
    req.headers.authorization as string,
    process.env[ENV_SECRETS.JWT_SECRET] as string
  );

  let user: IUser | null = null;

  if (jwtToken) {
    let userDocumentData: DocumentData;

    try {
      userDocumentData = await getFirestore()
        .collection(COLLECTIONS.USERS)
        .doc(jwtToken!.id)
        .get();
    } catch (e: any) {
      logger.error("[MANAGER] Querying DB failed", e);
      res.status(500).json(generalError);
      return;
    }

    if (!userDocumentData.exists) {
      res
        .status(400)
        .json(new ResponseBody(null, false, [ERROR_MESSAGES.NOT_FOUND]));
      return;
    }

    user = userDocumentData.data() as IUser;
  }

  let reqBody: IBookingReq | null = null;

  try {
    reqBody = await parseBookingFormData(req.headers, req.body, ["bookings"]);
  } catch (e: unknown) {
    logger.error("[POST BOOKING] Parse booking data failed", e);
    return res
      .status(400)
      .json(new ResponseBody(null, false, [ERROR_MESSAGES.BAD_DATA]));
  }

  const validationErrors = postBookingValidator(reqBody);
  if (validationErrors) {
    return res
      .status(400)
      .json(new ResponseBody(null, false, validationErrors));
  }

  let bookingSlots: IBookingSlot[] = [];
  try {
    const slotsRefs: DocumentReference[] = reqBody.bookings.map((id: string) =>
      db.collection(COLLECTIONS.AVAILABLE_SLOTS).doc(id)
    );

    const bookingSlotsDocSnapshots: DocumentSnapshot<DocumentData>[] =
      await db.getAll(...slotsRefs);
    bookingSlots = bookingSlotsDocSnapshots.map((d: DocumentData) => d.data());
  } catch (e: unknown) {
    logger.error("[POST BOOKING] Incorrect bookings slots data", e);
    return res
      .status(400)
      .json(new ResponseBody(null, false, [ERROR_MESSAGES.BAD_DATA]));
  }

  const uniqueProductIds = Array.from(
    new Set(bookingSlots.map((s: IBookingSlot) => s.productId))
  );

  const products: IProduct[] = [];

  for (const productId of uniqueProductIds) {
    const snap = await db
      .collection(COLLECTIONS.PRODUCTS)
      .where("id", "==", productId)
      .get();

    snap.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() } as IProduct);
    });
  }

  let confirmToken;
  try {
    confirmToken = generateJwt(
      { userEmail: reqBody.email, createdAt: Date.now() },
      jwtSecret,
      { expiresIn: resetTokenExp }
    );
  } catch (error: unknown) {
    logger.error(
      "[POST BOOKING] Signing JWT for admin booking confirmation email failed"
    );
    res.status(500).json(generalError);
  }

  const userNameFromReqBody = reqBody.name;
  const userNameFromJwt =
    user?.firstname && user?.lastname
      ? `${user?.firstname} ${user?.lastname}`
      : "";

  const mailOptionsAdmin = GetAdminNotificationTemplate({
    adminEmailAddress,
    products,
    bookings: bookingSlots,
    email: reqBody.email,
    comment: reqBody.comment,
    phone: reqBody.phone,
    name: userNameFromReqBody || userNameFromJwt,
    confirmLink: `${uiUrl}/confirm-booking-admin/${confirmToken}`,
  });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env[ENV_SECRETS.MAIL_USER],
      pass: process.env[ENV_SECRETS.MAIL_PASS],
    },
  });

  await transporter.sendMail(mailOptionsAdmin, (error: unknown) => {
    if (error) {
      logger.error(
        "[POST BOOKING] Nodemailer failed to send admin confirmation email",
        error
      );

      res
        .status(500)
        .send(new ResponseBody(null, false, [ERROR_MESSAGES.GENERAL]));
      return;
    }

    logger.info(`[POST BOOKING] Booking admin confirmation email was sent.`);
  });

  const storage = getStorage();

  const { paymentFile } = reqBody;
  const bucket = storage.bucket();
  const file = bucket.file(paymentFile.filename);
  await file.save(paymentFile.buffer, {
    contentType: paymentFile.detectedMime || paymentFile.mimeType,
    metadata: {
      originalName: paymentFile.filename,
      width: paymentFile.width?.toString(),
      height: paymentFile.height?.toString(),
    },
  });
  await file.makePublic();
  const paymentFileLink = `https://storage.googleapis.com/${bucket.name}/${file.name}`;

  const booking: IBooking = {
    paymentFileLink,
    slots: reqBody.bookings,
    email: user?.email || reqBody.email,
    phone: user?.phone || reqBody.phone,
    comment: reqBody.comment,
    isConfirmed: false,
    lang: reqBody.lang,
    name: reqBody.name || user ? `${user?.firstname} ${user?.lastname}` : "",
  };

  try {
    await db.collection(COLLECTIONS.BOOKINGS).add(booking);
  } catch (e: unknown) {
    logger.error("[POST BOOKING] Saving booking data failed", e);

    return res
      .status(500)
      .json(new ResponseBody(null, false, [ERROR_MESSAGES.GENERAL]));
  }

  res.send(reqBody);
}

async function deleteBookingHandler(req: Request, res: Response): Promise<any> {
  return res
    .status(404)
    .json(new ResponseBody(null, false, [ERROR_MESSAGES.NOT_EXIST]));
}
