import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { AtStrategy, RtStrategy } from './strategies';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [JwtModule.register({})],
  providers: [
    AuthService,
    AuthRepository,
    AtStrategy,
    RtStrategy,
    ConfigService,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
