import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthRepository } from 'src/auth/auth.repository';

@Module({
  controllers: [UsersController],
  providers: [UsersService, AuthRepository],
})
export class UsersModule {}
