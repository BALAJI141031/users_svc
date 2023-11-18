import { Injectable } from '@nestjs/common';
import { SignUpDto } from './dto';
import { AuthRepository } from './auth.repository';

@Injectable()
export class AuthService {
  constructor(private authRepository: AuthRepository) {}
  async signup(signUpDto: SignUpDto) {
    const { firstName, lastName, email, password, userName } = signUpDto;
    await this.authRepository.create({
      firstName,
      lastName,
      email,
      hash: password,
      userName,
    });
  }
  async signin() {}
  async logout() {}
  async refresh() {}
}
