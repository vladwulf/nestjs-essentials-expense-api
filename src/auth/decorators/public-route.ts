import { SetMetadata } from '@nestjs/common';

export const PublicRoute = () => SetMetadata('PUBLIC_ROUTE', true);
