import { Transactional } from '@nestjs-cls/transactional';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { UserRole } from 'generated/prisma/enums';
import { User } from './entities/user.entity';
import { UserRepository } from './user.repository';
import { randomUUID } from 'node:crypto';

export const CRYPT_SALT = parseInt(process.env.CRYPT_SALT || '10');

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(createUserDto: CreateUserDto) {
    const now = BigInt(Date.now());
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      CRYPT_SALT,
    );

    return await this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      role: createUserDto.role ?? UserRole.viewer,
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
    });
  }

  async findAll() {
    return await this.userRepository.findAll();
  }

  async findOne(id: User['id']) {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return user;
  }

  async findByLogin(login: User['login']): Promise<User | undefined> {
    return await this.userRepository.findBy({ login });
  }

  @Transactional()
  async updatePassword(
    id: User['id'],
    updateUserPasswordDto: UpdateUserPasswordDto,
  ) {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const isMatch = await bcrypt.compare(
      updateUserPasswordDto.oldPassword,
      user.password,
    );

    if (!isMatch) {
      throw new HttpException('Wrong password', HttpStatus.FORBIDDEN);
    }

    const hashedPassword = await bcrypt.hash(
      updateUserPasswordDto.newPassword,
      CRYPT_SALT,
    );

    return await this.userRepository.update(id, {
      password: hashedPassword,
      updatedAt: BigInt(Date.now()),
    });
  }

  async remove(id: User['id']) {
    if (!(await this.userRepository.delete(id))) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
  }
}
