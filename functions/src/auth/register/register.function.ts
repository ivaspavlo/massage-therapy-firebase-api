import { onRequest } from 'firebase-functions/v2/https';
import { Request, Response } from 'firebase-functions';
import { QuerySnapshot, getFirestore } from 'firebase-admin/firestore';
import { ResponseBody } from '../../shared/models';
import { COLLECTIONS, ERROR_MESSAGES } from '../../shared/constants';
import { RegisterValidator } from './register.validator';
import { IRegisterReq } from './register.interface';
import { RegisterMapper } from './register.mapper';


export const RegisterFunction = onRequest(
  async (req: Request, res: Response): Promise<void> => {
    const generalError = new ResponseBody(null, false, [ERROR_MESSAGES.GENERAL]);
    const userData: IRegisterReq = req.body;
    let validationErrors: string[] | null = null;

    try {
      const existingUser: QuerySnapshot = await getFirestore().collection(COLLECTIONS.USERS).where('email', '==', userData.email).get();
      validationErrors = RegisterValidator(userData, existingUser);
    } catch(e: any) {
      res.status(500).json(generalError);
      return;
    }

    if (validationErrors) {
      res.status(400).json(new ResponseBody(null, false, validationErrors));
      return;
    }

    let prospectiveUser;

    try {
      prospectiveUser = await RegisterMapper(userData);
    } catch (e: any) {
      res.status(500).json(generalError);
      return;
    }

    try {
      await getFirestore()
        .collection(COLLECTIONS.USERS)
        .add(prospectiveUser);
    } catch (e: any) {
      res.status(500).json(generalError);
      return;
    }

    res.status(201).send(new ResponseBody({}, true));
  }
);
