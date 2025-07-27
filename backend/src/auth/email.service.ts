import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
    private transporter: nodemailer.Transporter;

    constructor(private configService: ConfigService) {
        // In production, use your actual SMTP configuration
        this.transporter = nodemailer.createTransport({
            host: this.configService.get('SMTP_HOST'),
            port: this.configService.get('SMTP_PORT'),
            secure: true,
            auth: {
                user: this.configService.get('SMTP_USER'),
                pass: this.configService.get('SMTP_PASS'),
            },
        });
    }

    async sendHouseholdInvite(
        toEmail: string,
        inviterEmail: string,
        householdName: string,
        inviteToken: string,
    ): Promise<void> {
        const baseUrl = this.configService.get('FRONTEND_URL');
        const inviteUrl = `${baseUrl}/join-household?token=${inviteToken}`;

        await this.transporter.sendMail({
            from: `"Shilat Money" <${this.configService.get('SMTP_FROM')}>`,
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
