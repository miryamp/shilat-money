import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { GoogleUser, GoogleValidationResponse } from 'shared/entities/auth.interface';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(
        configService: ConfigService,
        private authService: AuthService,
    ) {
        const clientID = configService.get<string>('GOOGLE_CLIENT_ID');
        const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');
        const callbackURL = configService.get<string>('GOOGLE_CALLBACK_URL');

        if (!clientID || !clientSecret || !callbackURL) {
            throw new Error('Missing Google OAuth configuration');
        }

        super({
            clientID,
            clientSecret,
            callbackURL,
            scope: ['email', 'profile'],
        });
    }

    async validate(
        _accessToken: string,
        _refreshToken: string,
        profile: Profile,
    ): Promise<{ profile: Profile }> {
        if (!profile.emails?.length) {
            throw new Error('No email provided from Google');
        }

        if (!profile.name) {
            throw new Error('No name provided from Google');
        }

        return { profile };
    }
}
