import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
    private resend: Resend;

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('RESEND_API_KEY');
        if (!apiKey) {
            throw new Error('RESEND_API_KEY is not configured in environment variables. Please check your .env file in the backend folder.');
        }
        this.resend = new Resend(apiKey);
    }

    async sendHouseholdInvite(
        toEmail: string,
        inviterEmail: string,
        householdName: string,
        inviteToken: string,
    ): Promise<void> {
        const baseUrl = this.configService.get('FRONTEND_URL');
        const inviteUrl = `${baseUrl}/join-household?token=${inviteToken}`;

        await this.resend.emails.send({
            from: 'onboarding@resend.dev',
            to: toEmail,
            subject: `You're invited to join ${householdName} on Shilat Money`,
            text: `
Hello!

${inviterEmail} has invited you to join their household "${householdName}" on ShilatMoney.

Click the link below to join:
${inviteUrl}

If you don't have an account yet, you'll be able to create one after clicking the link.

This invite will expire in 24 hours.

Best regards,
The Shilat Money Team
            `,
            html: `
<h2>You're invited to join ${householdName}!</h2>
<p>${inviterEmail} has invited you to join their household on ShilatMoney.</p>
<p><a href="${inviteUrl}" style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Join Household</a></p>
<p>If you don't have an account yet, you'll be able to create one after clicking the link.</p>
<p><small>This invite will expire in 24 hours.</small></p>
            `,
        });
    }
}