import * as jwt from 'jsonwebtoken';
import * as functions from 'src/index';
import dotenv from 'dotenv';
import firebaseFunctionsTest from 'firebase-functions-test';
import { defineString } from 'firebase-functions/params';
import { DocumentData, QueryDocumentSnapshot, getFirestore } from 'firebase-admin/firestore';
import { describe, expect, afterAll, beforeAll, test } from '@jest/globals';
import { ENV_KEYS, COLLECTIONS } from 'src/shared/constants';


firebaseFunctionsTest({
  projectId: 'mt-stage-db6be',
  databaseURL: 'https://mt-stage-db6be.firebaseio.com'
}, process.env.FIREBASE_SERVICE_ACCOUNT || './mt-stage-db6be-a531eb8c5a6b.json');

dotenv.config({ path: './.env.local' });

const resetTokenExp = defineString(ENV_KEYS.RESET_TOKEN_EXP).value();
const jwtSecret = defineString(ENV_KEYS.JWT_SECRET).value();

describe('user', () => {
  const REGISTERED_USER = {
    firstname: 'Test',
    lastname: 'Testovich',
    email: 'test@testmail.com',
    birthday: '1990-08-08',
    phone: '+111222333444',
    password: 'TestPass1!',
    lang: 'en',
    hasUserConsent: true
  };

  let USER_ID: string;
  let VALID_AUTH_TOKEN: string;
  let INVALID_AUTH_TOKEN: string;

  beforeAll(async () => {
    await getFirestore().collection(COLLECTIONS.USERS).add(REGISTERED_USER);
    try {
      const queryByEmail = await getFirestore().collection(COLLECTIONS.USERS).where('email', '==', REGISTERED_USER.email).get();
      const userDocumentSnapshot: QueryDocumentSnapshot | undefined = queryByEmail.docs.find((d: any) => !!d);
      USER_ID = userDocumentSnapshot!.id;
      VALID_AUTH_TOKEN = 'Bearer ' + jwt.sign({ id: USER_ID }, jwtSecret, { expiresIn: resetTokenExp });
    } catch (error: any) {
      // no action
    }
    INVALID_AUTH_TOKEN = 'Bearer ' + jwt.sign({ id: 'incorrect_user_id' }, jwtSecret, { expiresIn: resetTokenExp });
  });

  afterAll(async () => {
    const usersQuery = getFirestore().collection(COLLECTIONS.USERS).where('email', '==', REGISTERED_USER  .email);
    const querySnapshot = await usersQuery.get();
    querySnapshot.forEach((doc: DocumentData) => doc.ref.delete());
  });

  test('[GET USER] should return correct user by id', async () => {
    const res = {
      status: (code: number) => {
        return {
          send: (value: any) => {
            expect(value.data.id).toBe(USER_ID);
          },
          json: (value: any) => { }
        }
      }
    };
    await functions.user({ headers: { authorization: VALID_AUTH_TOKEN as string } } as any, res as any);
  });

  test('[GET USER] should return 400 if user was not found', async () => {
    const res = {
      status: (code: number) => {
        expect(code).toBe(400);
        return {
          send: (value: any) => { },
          json: (value: any) => { }
        }
      }
    };
    await functions.user({ headers: { authorization: INVALID_AUTH_TOKEN as string } } as any, res as any);
  });
});