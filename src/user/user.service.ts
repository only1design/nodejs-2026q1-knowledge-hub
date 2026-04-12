import { Transactional } from '@nestjs-cls/transactional';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { UserRole } from 'generated/prisma/enums';
import { User } from './entities/user.entity';
import { UserRepository } from './user.repository';
import { randomUUID } from 'node:crypto';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(createUserDto: CreateUserDto) {
    const now = BigInt(Date.now());

    return await this.userRepository.create({
      ...createUserDto,
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

  @Transactional()
  async updatePassword(
    id: User['id'],
    updateUserPasswordDto: UpdateUserPasswordDto,
  ) {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (user.password === updateUserPasswordDto.oldPassword) {
      return await this.userRepository.update(id, {
        password: updateUserPasswordDto.newPassword,
        updatedAt: BigInt(Date.now()),
      });
    } else {
      throw new HttpException('Wrong password', HttpStatus.FORBIDDEN);
    }
  }

  async remove(id: User['id']) {
    if (!(await this.userRepository.delete(id))) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
  }
}
