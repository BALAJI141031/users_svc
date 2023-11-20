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
import { AuthGuard } from '@nestjs/passport';

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
    this.authService.logout(user['sub']);
  }
  @Post('refresh')
  // @UseGuards(AuthGuard('jwt-refresh'))
  @HttpCode(HttpStatus.OK)
  async refresh() {
    this.authService.refresh();
  }
}
