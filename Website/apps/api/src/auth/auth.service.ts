import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { VerifyOtpDto } from './dto/verify-otp.dto.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.usersService.create({
      email: dto.email,
      passwordHash,
      name: dto.name,
      role: dto.role,
    });

    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
      ...tokens,
    };
  }

  async refresh(userId: string, oldRefreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access denied');
    }

    if (user.refreshToken !== oldRefreshToken) {
      // Possible token reuse — revoke all
      await this.usersService.updateRefreshToken(userId, null);
      throw new UnauthorizedException('Access denied');
    }

    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !user.otpHash || !user.otpExpiresAt) {
      throw new BadRequestException('OTP not found or expired');
    }

    const otpHash = user.otpHash;
    if (typeof otpHash !== 'string') {
      throw new BadRequestException('OTP not found or expired');
    }

    if (user.otpExpiresAt < new Date()) {
      throw new BadRequestException('OTP expired');
    }

    const otpValid = await bcrypt.compare(dto.otp, otpHash);
    if (!otpValid) {
      throw new BadRequestException('Invalid OTP');
    }

    // Clear OTP and mark email as verified
    await this.usersService.update(user.id, {
      otpHash: null,
      otpExpiresAt: null,
      emailVerified: true,
    });

    return { message: 'Email verified successfully' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      // Return generic message for security
      return { message: 'If email exists, reset link will be sent' };
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 12);
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    await this.usersService.update(user.id, {
      otpHash,
      otpExpiresAt,
    });

    // TODO: Send OTP via email (Resend/Nodemailer)
    console.log(`[TODO] Send OTP ${otp} to ${user.email}`);

    return { message: 'If email exists, reset link will be sent' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    // For now, treat token as reset token hash
    // TODO: In production, verify JWT token instead
    const users = await this.usersService.findAll();
    const user = users.find(
      (u) => u.resetTokenHash && u.resetTokenHash === dto.token,
    );

    if (!user || !user.resetTokenExpiresAt) {
      throw new BadRequestException('Invalid or expired token');
    }

    if (user.resetTokenExpiresAt < new Date()) {
      throw new BadRequestException('Token expired');
    }

    const newPasswordHash = await bcrypt.hash(dto.newPassword, 12);
    await this.usersService.update(user.id, {
      passwordHash: newPasswordHash,
      resetTokenHash: null,
      resetTokenExpiresAt: null,
    });

    return { message: 'Password reset successfully' };
  }

  async getMe(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
        emailVerified: user.emailVerified,
      },
    };
  }

  private async generateTokens(payload: JwtPayload) {
    const accessSecret =
      this.configService.get<string>('JWT_ACCESS_SECRET') ??
      this.configService.get<string>('JWT_SECRET');
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: accessSecret,
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: refreshSecret,
        expiresIn: '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
