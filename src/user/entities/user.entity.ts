import { Exclude } from 'class-transformer';

export enum UserRole {
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  VIEWER = 'VIEWER',
}

export class User {
  id: string;

  login: string;

  @Exclude()
  password: string;

  role: UserRole;

  createdAt: number;

  updatedAt: number;
  //
  // constructor(partial: Partial<User>) {
  //   Object.assign(this, partial);
  //
  //   const now = Date.now();
  //   this.createdAt = now;
  //   this.updatedAt = now;
  //   this.id = crypto.randomUUID();
  // }
}
