import { Exclude } from 'class-transformer';
import { UserRole } from 'generated/prisma/enums';

export class User {
  id: string;

  login: string;

  @Exclude()
  password: string;

  role: UserRole;

  createdAt: bigint;

  updatedAt: bigint;
}
