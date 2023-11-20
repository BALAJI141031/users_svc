import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { AuthRepository } from 'src/auth/auth.repository';

@Injectable()
export class UsersService {
  constructor(private authRepository: AuthRepository) {}
  async getUserDetails(id: string) {
    if (!id || typeof parseInt(id) !== 'number') {
      throw new BadRequestException('Invalid Request Id');
    }
    try {
      return await this.authRepository.getUserById(parseInt(id), {
        userName: true,
        firstName: true,
        lastName: true,
        email: true,
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      throw error;
    }
  }
}
