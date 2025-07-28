import { Currency } from "./currency.enum";
import { Language } from "./language.enum";

export interface NewHouseholdData {
  name: string;
  currency: Currency;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
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
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    householdId: string;
  };
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

export interface HouseholdInviteStatus {
  isValid: boolean;
  householdName?: string;
  inviterEmail?: string;
  expired?: boolean;
}
