import { BadRequestException, Injectable } from '@nestjs/common';
import { SignUpDto } from './dto';
import { AuthRepository } from './auth.repository';
import { Tokens } from './types';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
@Injectable()
export class AuthService {
  constructor(
    private authRepository: AuthRepository,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async signup(signUpDto: SignUpDto): Promise<Tokens> {
    try {
      const { firstName, lastName, email, password, userName } = signUpDto;
      const hash = await argon.hash(password);
      const user = await this.authRepository.create({
        firstName,
        lastName,
        email,
        hash,
        userName,
      });
      const tokens = await this.getTokens(user.id, user.email);
      await this.updateRtHash(user.id, tokens.refresh_token);
      return tokens;
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const uniqueFields = error.meta.target as string[];
        if (uniqueFields.includes('email')) {
          throw new BadRequestException('Email is already taken.');
        }
        if (uniqueFields.includes('username')) {
          throw new BadRequestException('Username is already taken.');
        }
      }
      console.log('error------------->', error, 'error----------------->');
      throw error;
    }
  }
  async signin() {}
  async logout() {}
  async refresh() {}

  // ---------------*****************Utils*********************-------
  async updateRtHash(userId: number, rt: string): Promise<void> {
    const hash = await argon.hash(rt);
    await this.authRepository.update(userId, { hashedRt: hash });
  }
  async getTokens(userId: number, email: string): Promise<Tokens> {
    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        { secret: this.config.get<string>('AT_SECRET'), expiresIn: 15 * 60 },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: this.config.get<string>('RT_SECRET'),
          expiresIn: 15 * 60 * 24 * 7,
        },
      ),
    ]);
    return { access_token, refresh_token };
  }
}
