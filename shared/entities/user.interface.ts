import { IBaseUser } from "./base-user.interface";

export interface IUser extends IBaseUser {
  id: string;
  householdId: string;
  password: string;
  language: string;
}
