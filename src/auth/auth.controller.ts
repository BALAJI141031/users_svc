import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto, SignUpDto } from './dto';
import { Request } from 'express';
import { RtGuard } from './common/gaurds/rt.guard';
import { AtGuard } from './common/gaurds';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('local/signup')
  async signup(@Body() signUpDto: SignUpDto) {
    return await this.authService.signup(signUpDto);
  }
  @Post('local/signin')
  async signin(@Body() signInDto: SignInDto) {
    return await this.authService.signin(signInDto);
  }
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AtGuard)
  async logout(@Req() req: Request) {
    const user = req['user'];
    return this.authService.logout(user['sub']);
  }
  @Post('refresh')
  @UseGuards(RtGuard)
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request) {
    const user = req['user'];
    return this.authService.refresh(user['email'], user['refreshToken']);
  }
}
