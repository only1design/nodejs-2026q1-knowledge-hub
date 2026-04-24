import {
  HttpException,
  HttpStatus,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class PositiveIntPipe implements PipeTransform<string, number> {
  transform(value: string): number {
    const parsed = parseInt(value, 10);

    if (isNaN(parsed)) {
      throw new HttpException(
        `'${value}' is not a valid integer`,
        HttpStatus.BAD_REQUEST,
      );
    }
    if (parsed <= 0) {
      throw new HttpException(
        'Value must be a positive integer',
        HttpStatus.BAD_REQUEST,
      );
    }

    return parsed;
  }
}
