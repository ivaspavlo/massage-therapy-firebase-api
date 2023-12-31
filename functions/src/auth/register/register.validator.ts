import { QuerySnapshot } from 'firebase-admin/firestore';
import { IRegisterReq } from './register.interface';
import { ERROR_MESSAGES, TRANSLATIONS } from '../../shared/constants';
import {
  birthdayValidator,
  emailValidator,
  langFieldValidator,
  maxCharQty,
  minCharQty,
  passwordValidator,
  stringValidator,
  validate
} from '../../shared/utils';


const fieldValidators: Record<keyof IRegisterReq, Function[]> = {
  firstname: [minCharQty(3), maxCharQty(20)],
  lastname: [minCharQty(3), maxCharQty(20)],
  email: [emailValidator],
  birthday: [birthdayValidator],
  phone: [minCharQty(9), maxCharQty(15)],
  password: [passwordValidator],
  lang: [stringValidator, langFieldValidator(TRANSLATIONS)]
}

export const RegisterValidator = (req: IRegisterReq, queryByEmail: QuerySnapshot): string[] | null => {
  if (!queryByEmail.empty) {
    return [ERROR_MESSAGES.DUPLICATE];
  }

  const errors = validate(req, fieldValidators);

  if (errors.length) {
    return [`${ERROR_MESSAGES.FIELDS_VALIDATION}: ${errors.join(',')}`];
  }

  return null;
}
