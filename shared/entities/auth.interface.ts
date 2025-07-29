import { Currency } from "./currency.enum";
import { Language } from "./language.enum";
import { IUser } from "./user.interface";
import { IBaseUser } from "./base-user.interface";

export interface NewHouseholdData {
  name: string;
  currency: Currency;
}

export interface RegisterDto extends IBaseUser {
  password: string;
  language: Language;
  newHousehold?: NewHouseholdData;
  householdToken?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: IUser
}

export interface HouseholdInviteResponse {
  inviteToken: string;
  expiresAt: Date;
}

export interface ShareHouseholdByEmailRequest {
  email: string;
}

export interface AcceptHouseholdInviteRequest {
  inviteToken: string;
}

export interface GoogleUser extends IBaseUser {
  googleId: string;
}

export interface HouseholdInviteStatus {
  isValid: boolean;
  householdName?: string;
  inviterEmail?: string;
  expired?: boolean;
}
