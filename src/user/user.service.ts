import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { UserRole } from './entities/user.entity';
import { UserRepository } from './user.repository';
import { randomUUID } from 'node:crypto';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  create(createUserDto: CreateUserDto) {
    const now = Date.now();

    return this.userRepository.create({
      id: randomUUID(),
      login: createUserDto.login,
      password: createUserDto.password,
      version: 1,
      role: createUserDto.role ?? UserRole.VIEWER,
      createdAt: now,
      updatedAt: now,
    });
  }

  findAll() {
    return this.userRepository.findAll();
  }

  findOne(id: string) {
    const user = this.userRepository.findById(id);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return user;
  }

  updatePassword(id: string, updateUserPasswordDto: UpdateUserPasswordDto) {
    const user = this.userRepository.findById(id);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (user.password === updateUserPasswordDto.oldPassword) {
      return this.userRepository.update(id, {
        password: updateUserPasswordDto.newPassword,
        version: user.version + 1,
        updatedAt: Date.now(),
      });
    } else {
      throw new HttpException('Wrong password', HttpStatus.FORBIDDEN);
    }
  }

  remove(id: string) {
    if (!this.userRepository.delete(id)) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
  }
}
