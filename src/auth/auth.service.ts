import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SignInDto, SignUpDto } from './dto';
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

  async signup(signUpDto: SignUpDto) {
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
      return { ...tokens, userName, email };
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const uniqueFields = error.meta.target as string[];
        if (uniqueFields.includes('email')) {
          throw new BadRequestException('Email is already taken.');
        }
        if (uniqueFields.includes('userName')) {
          throw new BadRequestException('Username is already taken.');
        }
      }
      throw error;
    }
  }
  async signin(signInDto: SignInDto) {
    try {
      const { email, password } = signInDto;
      //no need to check null for use, handled in query level
      const { hash, id, userName, firstName, lastName } =
        await this.authRepository.getUserByEmail(email, {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          userName: true,
          hash: true,
        });
      const passwordMatches = await argon.verify(hash, password);
      if (!passwordMatches) throw new ForbiddenException('Access Denied');
      const { access_token, refresh_token } = await this.getTokens(id, email);
      await this.updateRtHash(id, refresh_token);
      return {
        refresh_token,
        access_token,
        email,
        firstName,
        lastName,
        userName,
      };
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('User Not Found.');
      }
      throw error;
    }
  }
  async logout(userId: number): Promise<boolean> {
    try {
      await this.authRepository.updateMany(
        {
          id: userId,
          hashedRt: {
            not: null,
          },
        },
        {
          hashedRt: null,
        },
      );
      return true;
    } catch (error) {
      throw error;
    }
  }
  async refresh(email: string, rt: string) {
    try {
      const { hashedRt, id } = await this.authRepository.getUserByEmail(email, {
        id: true,
        email: true,
        hash: true,
        hashedRt: true,
      });
      const rtMatches = await argon.verify(hashedRt, rt);
      console.log(rtMatches);
      if (!rtMatches) throw new ForbiddenException('Access Denied');
      const tokens = await this.getTokens(id, email);
      await this.updateRtHash(id, tokens.refresh_token);
      return tokens;
    } catch (error) {
      throw error;
    }
  }

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
