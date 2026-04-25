import { Test } from '@nestjs/testing';
import { UserRole } from '../../generated/prisma/enums';
import { ForbiddenError, NotFoundError } from '../errors/app.errors';
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
            findAll: vi.fn(),
            findById: vi.fn(),
            findBy: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
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

  describe('findAll', () => {
    test('Should return all users', async () => {
      const mockUser = { id: 'user-id', login: 'login' };
      vi.spyOn(userRepository, 'findAll').mockResolvedValue([
        mockUser,
      ] as never);

      await expect(userService.findAll()).resolves.toEqual([mockUser]);
    });
  });

  describe('findOne', () => {
    test('Should throw error if user not found', async () => {
      vi.spyOn(userRepository, 'findById').mockResolvedValue(undefined);

      await expect(userService.findOne('id')).rejects.toThrow(
        new NotFoundError('User not found'),
      );
      expect(userRepository.findById).toHaveBeenCalledWith('id');
    });

    test('Should return user when found', async () => {
      const mockUser = { id: 'user-id', login: 'login' };
      vi.spyOn(userRepository, 'findById').mockResolvedValue(mockUser as never);

      await expect(userService.findOne('user-id')).resolves.toEqual(mockUser);
    });
  });

  describe('findByLogin', () => {
    test('Should find user by login', async () => {
      vi.spyOn(userRepository, 'findBy').mockResolvedValue('User' as never);

      await expect(userService.findByLogin('login')).resolves.toBe('User');
      expect(userRepository.findBy).toHaveBeenCalledWith({ login: 'login' });
    });
  });

  describe('remove', () => {
    test('Should throw 404 when user does not exist', async () => {
      vi.spyOn(userRepository, 'delete').mockResolvedValue(false as never);

      await expect(userService.remove('non-existent-id')).rejects.toThrow(
        new NotFoundError('User not found'),
      );
    });

    test('Should resolve without error when user exists', async () => {
      vi.spyOn(userRepository, 'delete').mockResolvedValue(true as never);

      await expect(userService.remove('user-id')).resolves.toBeUndefined();
    });
  });

  describe('updatePassword', () => {
    const mockUser = {
      id: 'user-id',
      login: 'login',
      password: 'hashed_password',
      role: UserRole.viewer,
    };

    test('Should throw 404 when user does not exist', async () => {
      vi.spyOn(userRepository, 'findById').mockResolvedValue(undefined);

      await expect(
        userService.updatePassword('non-existent-id', {
          oldPassword: 'old',
          newPassword: 'new',
        }),
      ).rejects.toThrow(new NotFoundError('User not found'));
    });

    test('Should throw 403 when old password does not match', async () => {
      vi.spyOn(userRepository, 'findById').mockResolvedValue(mockUser as never);
      vi.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(
        userService.updatePassword('user-id', {
          oldPassword: 'wrong-password',
          newPassword: 'new-password',
        }),
      ).rejects.toThrow(new ForbiddenError('Wrong password'));
    });

    test('Should hash new password and update on success', async () => {
      vi.spyOn(userRepository, 'findById').mockResolvedValue(mockUser as never);
      vi.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      vi.spyOn(bcrypt, 'hash').mockResolvedValue(
        'new_hashed_password' as never,
      );
      vi.spyOn(userRepository, 'update');

      await userService.updatePassword('user-id', {
        oldPassword: 'correct-password',
        newPassword: 'new-password',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('new-password', CRYPT_SALT);
      expect(userRepository.update).toHaveBeenCalledWith(
        'user-id',
        expect.objectContaining({ password: 'new_hashed_password' }),
      );
    });
  });
});
