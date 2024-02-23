import * as logger from 'firebase-functions/logger';
// import * as jwt from 'jsonwebtoken';
import { onRequest } from 'firebase-functions/v2/https';
import { DocumentData, getFirestore } from 'firebase-admin/firestore';
import { Request, Response } from 'firebase-functions';
import { COLLECTIONS, ENV_KEYS, ERROR_MESSAGES } from '../shared/constants';
import { ResponseBody, User } from '../shared/models';
import { IUser } from '../shared/interfaces';
// import { AdEmailReq } from 'src/auth/remind/remind.interface';
import { ManagerValidator } from './manager.validator';
import { IAdEmailReq } from './manager.interface';


export const ManagerFunction = onRequest(
  { secrets: [ENV_KEYS.JWT_SECRET] },
  async (req: Request, res: Response): Promise<void> => {
    const generalError = new ResponseBody(null, false, [ERROR_MESSAGES.GENERAL]);
    const jwtError = new ResponseBody(null, false, [ERROR_MESSAGES.JWT]);

    const authData = req.headers.authorization;

    if (!authData || typeof authData !== 'string') {
      res.status(401).json(jwtError);
    }

    // Strip 'Bearer'
    const clientJWT = authData!.split(' ')[1];

    // try {
    //   jwt.verify(clientJWT as string, process.env[ENV_KEYS.JWT_SECRET] as string);
    // } catch (e: any) {
    //   res.status(401).json(jwtError);
    //   return;
    // }

    let parsedClientToken: { [key:string]: string, id: string };
    try {
      parsedClientToken = JSON.parse(Buffer.from(clientJWT!.split('.')[1], 'base64').toString());
    } catch (e: any) {
      res.status(401).json(jwtError);
      return;
    }

    let userDocumentData: DocumentData;
    try {
      userDocumentData = (await getFirestore().collection(COLLECTIONS.USERS).doc(parsedClientToken.id).get());
    } catch(e: any) {
      logger.error('[Manager] Querying DB by email failed', e);
      res.status(500).json(generalError);
      return;
    }

    if (!userDocumentData.exists) {
      res.status(400).json(new ResponseBody(null, false, [ERROR_MESSAGES.NOT_FOUND]));
      return;
    }

    const user: IUser = userDocumentData.data() as IUser;

    if (!user.isAdmin) {
      res.status(401).json(jwtError);
      return;
    }

    switch(req.method) {
    case('POST'): return postManagerData(req, res, userDocumentData.id, user);
    }
  }
);

async function postManagerData(req: Request, res: Response, id: string, user: IUser): Promise<any> {
  switch(req.url) {
  case('email'): {
    const reqBody: IAdEmailReq = req.body;

    console.log(reqBody);

    const validationErrors: string[] | null = ManagerValidator(req.body);
    if (validationErrors) {
      res.status(400).send(new ResponseBody(null, false, [ERROR_MESSAGES.FIELDS_VALIDATION]));
      return;
    }

    logger.info('[MANAGER POST] Retrieved emails list');
    const emails = (await getFirestore().collection(COLLECTIONS.USERS).get()).docs.map((doc: any) => doc.email);
    console.log(emails);
    res.status(200).send(new ResponseBody(User.fromDocumentData({...user, id}), true));
  }
  }
}
