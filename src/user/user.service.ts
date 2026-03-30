import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { User, UserRole } from './entities/user.entity';
import { UserRepository } from './user.repository';
import { randomUUID } from 'node:crypto';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  create(createUserDto: CreateUserDto) {
    const { login, password, role } = createUserDto;
    const now = Date.now();

    return this.userRepository.create({
      login,
      password,
      role: role ?? UserRole.VIEWER,
      id: randomUUID(),
      version: 1,
      createdAt: now,
      updatedAt: now,
    });
  }

  findAll() {
    return this.userRepository.findAll();
  }

  findOne(id: User['id']) {
    const user = this.userRepository.findById(id);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return user;
  }

  updatePassword(id: User['id'], updateUserPasswordDto: UpdateUserPasswordDto) {
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

  remove(id: User['id']) {
    if (!this.userRepository.delete(id)) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
  }
}
