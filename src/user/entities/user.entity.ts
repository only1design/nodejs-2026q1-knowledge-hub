import { Exclude } from 'class-transformer';

export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

export class User {
  id: string;

  login: string;

  @Exclude()
  password: string;

  version: number;

  role: UserRole;

  createdAt: number;

  updatedAt: number;
}
