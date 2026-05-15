import { Injectable } from '@nestjs/common';
import {
  ForbiddenError,
  UnauthorizedError,
  ValidationError,
} from '../common/errors/app.errors';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { StringValue } from 'ms';
import { UserService } from 'src/user/user.service';
import { jwtConstants } from './auth.constants';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { SignupDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  private tokenBlacklist = new Set<string>();

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(signupDto: SignupDto) {
    const user = await this.userService.findByLogin(signupDto.login);

    if (user) {
      throw new ValidationError('Login is already taken');
    }

    return await this.userService.create(signupDto);
  }

  async login(loginDto: LoginDto) {
    const user = await this.userService.findByLogin(loginDto.login);

    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new ForbiddenError('Authentication failed');
    }

    return this.generateTokens({
      userId: user.id,
      login: user.login,
      role: user.role,
    });
  }

  logout(refreshToken: string) {
    this.tokenBlacklist.add(refreshToken);
  }

  async refreshToken(refreshDto: RefreshDto) {
    if (!refreshDto.refreshToken) {
      throw new UnauthorizedError('Refresh token not found');
    }

    if (this.tokenBlacklist.has(refreshDto.refreshToken)) {
      throw new ForbiddenError('Token has been revoked');
    }

    try {
      const payload = await this.jwtService.verifyAsync(
        refreshDto.refreshToken,
        {
          secret: jwtConstants.refreshSecret,
        },
      );

      return this.generateTokens({
        userId: payload.userId,
        login: payload.login,
        role: payload.role,
      });
    } catch {
      throw new ForbiddenError('Authentication failed');
    }
  }

  private async generateTokens(payload: {
    userId: string;
    login: string;
    role: string;
  }) {
    const [accessToken, newRefreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret: jwtConstants.refreshSecret,
        expiresIn: jwtConstants.refreshTll as StringValue,
      }),
    ]);

    return { accessToken, refreshToken: newRefreshToken };
  }
}
