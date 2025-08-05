export interface OAuthProfile {
  email: string;
  firstName: string;
  lastName: string;
  providerId: string;
  provider: 'google';
}

export interface GoogleProfile extends OAuthProfile {
  provider: 'google';
}
