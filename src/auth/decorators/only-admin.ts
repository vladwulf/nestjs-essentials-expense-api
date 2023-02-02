import { SetMetadata } from '@nestjs/common';

export const OnlyAdmin = () => SetMetadata('ONLY_ADMIN', true);
