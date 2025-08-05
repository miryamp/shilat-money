import { Controller, Get, Req, UseGuards, Redirect } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { BaseOAuthController } from './base.oauth.controller';
import { GoogleUser } from 'shared/entities/auth.interface';
import { switchMapTo } from 'rxjs';
import { response } from 'express';

@Controller('auth/google')
export class GoogleAuthController extends BaseOAuthController {
  constructor(
    protected readonly authService: AuthService,
    protected readonly configService: ConfigService,
  ) {
    super(authService, configService);
  }

  @Get()
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // initiates the Google OAuth2 login flow
  }

  @Get('callback')
  @UseGuards(AuthGuard('google'))
  @Redirect()
  async googleAuthCallback(@Req() req) {
    const userData = req.user.profile;
    const googleUser: GoogleUser = {
      email: userData.emails[0].value,
      firstName: userData.name.givenName || '',
      lastName: userData.name.familyName || '',
      googleId: userData.id,
    };

    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const validation = await this.authService.validateOrCreateGoogleUser(googleUser);

    // Encode the profile and validation data
    const data = encodeURIComponent(JSON.stringify({
      email: googleUser.email,
      firstName: googleUser.firstName,
      lastName: googleUser.lastName,
      accessToken: validation.accessToken,
      provider: 'google'
    }));
    // If new user, redirect to register, otherwise to login
    return validation.isNewUser? {
        statusCode: 302, 
      url: `${frontendUrl}/register?oauthData=${data}` 
    } : {
      statusCode: 302, 
      url: `${frontendUrl}/auth/google/callback?token=${validation.accessToken}` 
    };
  }
}
