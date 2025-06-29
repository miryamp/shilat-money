import { SetMetadata } from '@nestjs/common';

export const AllowSameOrigin = () => SetMetadata('allowSameOrigin', true);
