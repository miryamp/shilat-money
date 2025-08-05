import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export abstract class BaseOAuthController {
  constructor(
    protected readonly authService: AuthService,
    protected readonly configService: ConfigService,
  ) {}

  protected async handleOAuthCallback(profile: any, redirectUrl: string) {
    const user = await this.authService.validateOAuthUser(profile);
    const token = await this.authService.login(user);
    
    // Encode the profile and token data for frontend
    const data = encodeURIComponent(JSON.stringify({
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      picture: profile.picture,
      accessToken: token.accessToken,
      provider: profile.provider
    }));

    // Return the full URL for redirection
    return `${redirectUrl}?oauthData=${data}`;
  }
}
