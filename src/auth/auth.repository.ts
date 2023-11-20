import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignUpDto } from './dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuthRepository {
  constructor(private readonly prismaService: PrismaService) {}
  async create(data: Prisma.UserCreateInput) {
    return await this.prismaService.user.create({ data });
  }
  async update(userId: number, data: Prisma.UserUpdateInput) {
    await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data,
    });
  }
  async getUserByEmail(email: string, select: Prisma.UserSelect) {
    const resp = await this.prismaService.user.findFirstOrThrow({
      where: { email },
      select,
    });
    return resp;
  }
  async updateMany(where: Prisma.UserWhereInput, data: Prisma.UserUpdateInput) {
    await this.prismaService.user.updateMany({
      where,
      data: {
        hashedRt: null,
      },
    });
    return true;
  }
  async getUserById(id: number, select: Prisma.UserSelect) {
    const resp = await this.prismaService.user.findFirstOrThrow({
      where: { id },
      select,
    });
    return resp;
  }
}
