import { onRequest } from 'firebase-functions/v2/https';
import { Request, Response } from 'firebase-functions';
import { QuerySnapshot, getFirestore } from 'firebase-admin/firestore';

import { ResponseBody } from '../../shared/models';
import { COLLECTIONS, ERROR_MESSAGES } from '../../shared/constants';
import { RegisterValidator } from './register.validator';
import { IRegisterReq } from './register.interface';


export const RegisterFunction = onRequest(
  // { cors: CORS_URLS },
  async (req: Request, res: Response) => {
    const prospectiveUser: IRegisterReq = req.body;
    let validationErrors: string[] | null = null;

    try {
      const existingUser: QuerySnapshot = await getFirestore().collection(COLLECTIONS.USERS).where('email', '==', prospectiveUser.email).get();
      validationErrors = RegisterValidator(prospectiveUser, existingUser);
    } catch(e: any) {
      res.status(500).json(new ResponseBody(null, false, [ERROR_MESSAGES.GENERAL]));
      return;
    }

    if (validationErrors) {
      res.status(400).json(new ResponseBody(null, false, validationErrors));
      return;
    }

    try {
      await getFirestore()
        .collection(COLLECTIONS.USERS)
        .add(prospectiveUser);
    } catch (e: any) {
      res.status(500).json(new ResponseBody(null, false, [ERROR_MESSAGES.GENERAL]));
      return;
    }

    res.status(200).send(new ResponseBody({}, true));
  }
);
