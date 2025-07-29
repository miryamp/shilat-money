import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class TokenService {
    private readonly algorithm = 'aes-256-gcm';
    private readonly tokenTTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    private get secretKey(): Buffer {
        const key = process.env.HOUSEHOLD_TOKEN_SECRET || 'default-secret-key-that-is-very-long-32';
        // Use SHA256 to ensure we always have a 32-byte key
        return crypto.createHash('sha256').update(key).digest();
    }

    generateHouseholdToken(householdId: string): string {
        const expiresAt = Date.now() + this.tokenTTL;
        const data = JSON.stringify({ householdId, expiresAt });
        
        const iv = crypto.randomBytes(12);
        const cipher = crypto.createCipheriv(this.algorithm, Buffer.from(this.secretKey), iv);
        
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        const authTag = cipher.getAuthTag();
        
        // Combine IV, encrypted data, and auth tag into a single string
        return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
    }

    decodeHouseholdToken(token: string): { householdId: string; expiresAt: number } {
        const [ivHex, encrypted, authTagHex] = token.split(':');
        
        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');
        
        const decipher = crypto.createDecipheriv(this.algorithm, Buffer.from(this.secretKey), iv);
        decipher.setAuthTag(authTag);
        
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        const { householdId, expiresAt } = JSON.parse(decrypted);
        
        if (expiresAt < Date.now()) {
            throw new Error('Token has expired');
        }
        
        return { householdId, expiresAt };
    }
}
