import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { UsersService } from './users.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';

const SENSITIVE_FIELDS = [
  'passwordHash',
  'refreshToken',
  'otpHash',
  'resetTokenHash',
] as const;

function stripSensitive(user: Record<string, unknown>) {
  const copy = { ...user };
  for (const key of SENSITIVE_FIELDS) delete copy[key];
  return copy;
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Request() req: { user: { sub: string } }) {
    const user = await this.usersService.findById(req.user.sub);
    if (!user) throw new NotFoundException('User not found');
    return stripSensitive(user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateMe(
    @Request() req: { user: { sub: string } },
    @Body() dto: UpdateProfileDto,
  ) {
    const updated = await this.usersService.updateProfile(req.user.sub, dto);
    return stripSensitive(updated);
  }
}
