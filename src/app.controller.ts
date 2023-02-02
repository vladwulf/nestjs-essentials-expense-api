import { Controller, Get } from '@nestjs/common';
import { name, version } from 'package.json';
import { PublicRoute } from './auth/decorators';

@PublicRoute()
@Controller()
export class AppController {
  @Get('/status')
  getStatus() {
    return {
      name,
      version,
    };
  }
}
