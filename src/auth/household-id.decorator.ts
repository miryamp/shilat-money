import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const HouseholdId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.householdId;
  },
);
