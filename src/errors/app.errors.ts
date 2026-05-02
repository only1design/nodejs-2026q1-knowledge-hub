import { HttpStatus } from '@nestjs/common';

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not Found') {
    super(HttpStatus.NOT_FOUND, message);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Bad Request') {
    super(HttpStatus.BAD_REQUEST, message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(HttpStatus.UNAUTHORIZED, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(HttpStatus.FORBIDDEN, message);
  }
}
