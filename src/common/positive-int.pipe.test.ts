import { HttpException, HttpStatus } from '@nestjs/common';
import { describe, it, expect, beforeEach } from 'vitest';
import { PositiveIntPipe } from './positive-int.pipe';

describe('PositiveIntPipe', () => {
  let pipe: PositiveIntPipe;

  beforeEach(() => {
    pipe = new PositiveIntPipe();
  });

  it.each([
    { input: '1', expected: 1 },
    { input: '42', expected: 42 },
    { input: '100', expected: 100 },
  ])('should parse "$input" to $expected', ({ input, expected }) => {
    expect(pipe.transform(input)).toBe(expected);
  });

  it.each([
    { input: '0', label: 'zero' },
    { input: '-1', label: 'negative number' },
    { input: '-100', label: 'large negative number' },
  ])('should throw 400 for $label', ({ input }) => {
    expect(() => pipe.transform(input)).toThrow(
      new HttpException(
        'Value must be a positive integer',
        HttpStatus.BAD_REQUEST,
      ),
    );
  });

  it.each([{ input: 'abc' }, { input: '' }, { input: 'one' }])(
    'should throw 400 for non-numeric "$input"',
    ({ input }) => {
      expect(() => pipe.transform(input)).toThrow(HttpException);
    },
  );
});
