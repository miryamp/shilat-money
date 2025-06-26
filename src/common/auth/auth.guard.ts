import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request: Request & { householdId? : string } = context.switchToHttp().getRequest<Request>();
        const cookie = request.cookies?.auth; // adjust cookie name as needed

        // TODO: Implement your real validation logic here
        if (!cookie) {
            throw new UnauthorizedException('No auth cookie');
        }

        // Simulate extracting householdId from cookie
        request.householdId = 'mock-household-id'; // Replace with real extraction logic

        return true;
    }
}
