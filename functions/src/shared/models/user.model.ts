import { IUser, LanguageType } from '../interfaces';


export class User {
  public id!: string;
  public created!: number;
  public firstname!: string;
  public lastname!: string;
  public email!: string;
  public phone!: string;
  public birthday!: number;
  public hasEmailConsent!: boolean;
  public isConfirmed!: boolean;
  public lang!: string;

  constructor(
    id: string,
    created: number,
    firstname: string,
    lastname: string,
    email: string,
    phone: string,
    birthday: number,
    hasEmailConsent: boolean,
    isConfirmed: boolean,
    lang: LanguageType
  ) {
    this.id = id;
    this.created = created;
    this.firstname = firstname;
    this.lastname = lastname;
    this.email = email;
    this.phone = phone;
    this.birthday = birthday;
    this.hasEmailConsent = hasEmailConsent;
    this.isConfirmed = isConfirmed;
    this.lang = lang;
  }

  public static fromDocumentData(userDocumentData: IUser): User {
    return new User(
      userDocumentData.id as string,
      userDocumentData.created as number,
      userDocumentData.firstname,
      userDocumentData.lastname,
      userDocumentData.email,
      userDocumentData.phone,
      userDocumentData.birthday,
      userDocumentData.hasEmailConsent,
      userDocumentData.isConfirmed,
      userDocumentData.lang
    );
  }
}
