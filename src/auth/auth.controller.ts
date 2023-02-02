import {
  Controller,
  Session,
  Body,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuthService } from './auth.service';
import { PublicRoute } from './decorators';
import { AuthDto } from './dto';
import { UserSession } from './types';

@PublicRoute()
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body() dto: AuthDto, @Session() session: UserSession) {
    const { id, email, role } = await this.authService.signup(dto);
    this.serializeSession(id, email, role, session);
  }

  @HttpCode(HttpStatus.OK)
  @Post('signin')
  async signin(@Body() dto: AuthDto, @Session() session: UserSession) {
    const { id, email, role } = await this.authService.signin(dto);
    this.serializeSession(id, email, role, session);
  }

  private serializeSession(
    id: number,
    email: string,
    role: Role,
    session: UserSession,
  ) {
    session.user = {
      id,
      email,
      role,
    };
  }
}
