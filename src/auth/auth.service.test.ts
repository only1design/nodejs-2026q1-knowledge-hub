import { createMock } from '@golevelup/ts-vitest';
import {
  ForbiddenError,
  UnauthorizedError,
  ValidationError,
} from '../common/errors/app.errors';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';

vi.mock('bcrypt');

const mockUser = {
  id: 'user-id',
  login: 'login',
  password: 'hashed_password',
  role: 'viewer',
};

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  const signupDto = { password: 'password', login: 'login' };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findByLogin: vi.fn(),
            create: vi.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: vi.fn().mockResolvedValue('mock-token'),
            verifyAsync: vi.fn(),
          },
        },
      ],
    })
      .useMocker(() => createMock())
      .compile();

    authService = moduleRef.get(AuthService);
    userService = moduleRef.get(UserService);
    jwtService = moduleRef.get(JwtService);
  });

  describe('signup', () => {
    it('should validate that login is not used by other users', async () => {
      vi.spyOn(userService, 'findByLogin').mockResolvedValue(undefined);

      await authService.signup(signupDto);

      expect(userService.findByLogin).toHaveBeenCalledWith('login');
      expect(userService.create).toHaveBeenCalledWith(signupDto);
    });

    it('should throw error login is used by other users', async () => {
      vi.spyOn(userService, 'findByLogin').mockResolvedValue('User' as never);

      await expect(authService.signup(signupDto)).rejects.toThrow(
        new ValidationError('Login is already taken'),
      );
    });
  });

  describe('login', () => {
    it('should return access and refresh tokens on valid credentials', async () => {
      vi.spyOn(userService, 'findByLogin').mockResolvedValue(mockUser as never);
      vi.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      vi.spyOn(jwtService, 'signAsync')
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      const result = await authService.login(signupDto);

      expect(jwtService.signAsync).toHaveBeenCalledWith({
        userId: mockUser.id,
        login: mockUser.login,
        role: mockUser.role,
      });

      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });

    it('should throw if user not found', async () => {
      vi.spyOn(userService, 'findByLogin').mockResolvedValue(undefined);

      await expect(authService.login(signupDto)).rejects.toThrow(
        new ForbiddenError('Authentication failed'),
      );
    });

    it('should throw if password does not match', async () => {
      vi.spyOn(userService, 'findByLogin').mockResolvedValue(mockUser as never);
      vi.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(authService.login(signupDto)).rejects.toThrow(
        new ForbiddenError('Authentication failed'),
      );
    });
  });

  describe('refreshToken', () => {
    const mockPayload = {
      userId: 'user-id',
      login: 'login',
      role: 'viewer',
    };

    it('should return new token pair on valid refresh token', async () => {
      vi.spyOn(jwtService, 'verifyAsync').mockResolvedValue(mockPayload);
      vi.spyOn(jwtService, 'signAsync')
        .mockResolvedValueOnce('new-access')
        .mockResolvedValueOnce('new-refresh');

      const result = await authService.refreshToken({
        refreshToken: 'valid-refresh',
      });

      expect(result).toEqual({
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
      });
    });

    it('should throw on missing refresh token', async () => {
      await expect(
        authService.refreshToken({ refreshToken: undefined }),
      ).rejects.toThrow(new UnauthorizedError('Refresh token not found'));
    });

    it('should throw on invalid/expired refresh token', async () => {
      vi.spyOn(jwtService, 'verifyAsync').mockRejectedValue(new Error());

      await expect(
        authService.refreshToken({ refreshToken: 'invalid-token' }),
      ).rejects.toThrow(new ForbiddenError('Authentication failed'));
    });

    it('should throw on blacklisted refresh token', async () => {
      authService.logout('revoked-token');

      await expect(
        authService.refreshToken({ refreshToken: 'revoked-token' }),
      ).rejects.toThrow(new ForbiddenError('Token has been revoked'));
    });
  });
});
