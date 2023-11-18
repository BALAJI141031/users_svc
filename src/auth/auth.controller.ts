import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('local/signup')
  async signup(@Body() signUpDto: SignUpDto) {
    return await this.authService.signup(signUpDto);
  }
  @Post('local/signin')
  async signin() {
    this.authService.signin();
  }
  @Post('logout')
  async logout() {
    this.authService.logout();
  }
  @Post('refresh')
  async refresh() {
    this.authService.refresh();
  }
}
