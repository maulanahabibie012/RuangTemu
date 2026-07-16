import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async create(data: {
    email: string;
    passwordHash: string;
    name: string;
    role?: 'ATTENDEE' | 'ORGANIZER';
  }) {
    return this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        name: data.name,
        role: data.role ?? 'ATTENDEE',
      },
    });
  }

  async updateRefreshToken(userId: string, refreshToken: string | null) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken },
    });
  }

  async updateProfile(
    userId: string,
    data: { name?: string; avatarUrl?: string },
  ) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  async update(
    userId: string,
    data: {
      otpHash?: string | null;
      otpExpiresAt?: Date | null;
      resetTokenHash?: string | null;
      resetTokenExpiresAt?: Date | null;
      emailVerified?: boolean;
      passwordHash?: string;
    },
  ) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  async findAll() {
    return this.prisma.user.findMany();
  }
}
