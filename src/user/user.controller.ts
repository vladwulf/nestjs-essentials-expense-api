import { Controller, Get } from '@nestjs/common';
import { GetUserId, OnlyAdmin } from '../auth/decorators';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @OnlyAdmin()
  @Get('all')
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Get('me')
  getMe(@GetUserId() userId: number) {
    return this.userService.getMe(userId);
  }
}
