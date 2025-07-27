import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // Let the parent AuthGuard handle any errors
    const validatedUser = super.handleRequest(err, user, info, context);
    
    if (validatedUser) {
      // Get the request object
      const request: Request & { householdId?: string; userId?: string } = context
        .switchToHttp()
        .getRequest();

      // Attach the householdId and userId to the request
      request.householdId = validatedUser.householdId;
      request.userId = validatedUser.id;
    }

    return validatedUser;
  }
}
