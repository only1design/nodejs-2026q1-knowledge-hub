import { HttpException, HttpStatus } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { UserRole } from '../../generated/prisma/enums';
import { UserRepository } from './user.repository';
import { CRYPT_SALT, UserService } from './user.service';
import * as bcrypt from 'bcrypt';

vi.mock('bcrypt');

describe('UserService', () => {
  let userService: UserService;
  let userRepository: UserRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: {
            create: vi.fn(),
            findById: vi.fn(),
            findBy: vi.fn(),
          },
        },
      ],
    }).compile();

    userService = moduleRef.get(UserService);
    userRepository = moduleRef.get(UserRepository);
  });

  describe('create', () => {
    test('Should store user password hashed', async () => {
      vi.spyOn(userRepository, 'create');
      vi.spyOn(bcrypt, 'hash').mockResolvedValue('hashed_password' as never);

      await userService.create({
        login: 'login',
        password: 'raw_password',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('raw_password', CRYPT_SALT);
      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          password: 'hashed_password',
        }),
      );
    });

    test('Should assign viewer role by default', async () => {
      vi.spyOn(userRepository, 'create');

      await userService.create({
        login: 'login',
        password: 'raw_password',
      });

      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          role: UserRole.viewer,
        }),
      );
    });

    test('Should assign user role if passed', async () => {
      vi.spyOn(userRepository, 'create');

      await userService.create({
        login: 'login',
        password: 'raw_password',
        role: UserRole.admin,
      });

      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          role: UserRole.admin,
        }),
      );
    });
  });

  describe('findOne', () => {
    test('Should throw error if user not found', async () => {
      vi.spyOn(userRepository, 'findById').mockResolvedValue(undefined);

      await expect(userService.findOne('id')).rejects.toThrow(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );
      expect(userRepository.findById).toHaveBeenCalledWith('id');
    });
  });

  describe('findByLogin', () => {
    test('Should find user by login', async () => {
      vi.spyOn(userRepository, 'findBy').mockResolvedValue('User' as never);

      await expect(userService.findByLogin('login')).resolves.toBe('User');
      expect(userRepository.findBy).toHaveBeenCalledWith({ login: 'login' });
    });
  });
});
