import { IValidatorSet } from "../interfaces/validator-set.interface";

export function validate(req: any, fieldValidators: {[key:string]: IValidatorSet}): string[] {
  return Object.entries(req).reduce((acc: string[], [key, value]) => {
    const currValidatorSet = fieldValidators[key];
    if (currValidatorSet.isOptional && value === undefined) {
      return acc;
    }
    if (!currValidatorSet.validators?.length) {
      return acc;
    }
    const hasError = currValidatorSet.validators.some((validator: any) => !validator(value));
    return hasError
      ? [...acc, key]
      : acc;
  }, []);
}

// At least: 8 characters, one letter, one number, one special character: #?!@$%^&*-/+//><~$%()=|;:
export function passwordValidator(value: string): boolean {
  return typeof value === 'string' && /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-/+//><~$%()=|;:]).{8,}$/.test(value);
}

export function birthdayValidator(value: string): boolean {
  if (typeof value !== 'string') {
    return false;
  }
  let parsedDate: Date;
  try {
    parsedDate = new Date(value);
  } catch(e: any) {
    return false;
  }
  return parsedDate.getFullYear() - parsedDate.getFullYear() <= 90;
}

export function minCharQty(limit: number): (v: string) => boolean {
  return (value): boolean => {
    return typeof value === 'string' && value.length >= limit;
  };
}

export function maxCharQty(limit: number): (v: string) => boolean {
  return (value): boolean => {
    return typeof value === 'string' && value.length <= limit;
  }
}

export function emailValidator(value: string): boolean {
  // eslint-disable-next-line
  return typeof value === 'string' && /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(value);
}

export function langFieldValidator(
  translations: {[key:string]: any}
): (value: string) => boolean {
  return (value: string) => translations[value];
}

export function stringValidator(value: any): boolean {
  return typeof value === 'string';
}

export function booleanValidator(value: any): boolean {
  return typeof value === 'boolean';
}

export function requiredValidator(value: any): boolean {
  return value !== undefined;
}
