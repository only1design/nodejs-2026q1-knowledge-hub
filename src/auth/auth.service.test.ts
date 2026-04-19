import { createMock } from '@golevelup/ts-vitest';
import { HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, vi, it, expect } from 'vitest';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';

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
        new HttpException('Login is already taken', HttpStatus.BAD_REQUEST),
      );
    });
  });
});
