import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AtGuard } from 'src/auth/common/gaurds';
import { Request } from 'express';
import { UsersService } from './users.service';

@Controller('user')
export class UsersController {
  constructor(private usersService: UsersService) {}
  @Get('details')
  @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  async getUserDetails(@Req() req: Request) {
    const user = req['user'];
    return this.usersService.getUserDetails(user['sub']);
  }
  @Get('details/:id')
  //   @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  async getUserDetailsById(@Param('id') userId: string) {
    return this.usersService.getUserDetails(userId);
  }
}
