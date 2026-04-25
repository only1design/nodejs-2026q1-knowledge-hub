import { Injectable, PipeTransform } from '@nestjs/common';
import { ValidationError } from '../errors/app.errors';

@Injectable()
export class PositiveIntPipe implements PipeTransform<string, number> {
  transform(value: string): number {
    const parsed = parseInt(value, 10);

    if (isNaN(parsed)) {
      throw new ValidationError(`'${value}' is not a valid integer`);
    }
    if (parsed <= 0) {
      throw new ValidationError('Value must be a positive integer');
    }

    return parsed;
  }
}
