import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { PaginationQueryDto, SortBy } from './pagination-query.dto';

describe('PaginationQueryDto', () => {
  it('should pass with no fields (all optional)', async () => {
    const errors = await validate(new PaginationQueryDto());
    expect(errors).toHaveLength(0);
  });

  it('should pass with valid values', async () => {
    const dto = plainToInstance(PaginationQueryDto, {
      page: '2',
      limit: '10',
      sortBy: 'createdAt',
      order: 'asc',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.page).toBe(2);
    expect(dto.limit).toBe(10);
  });

  it.each([
    { label: 'page = 0', input: { page: '0' }, field: 'page' },
    { label: 'limit = 0', input: { limit: '0' }, field: 'limit' },
    { label: 'page = -1', input: { page: '-1' }, field: 'page' },
  ])('should fail when $label', async ({ input, field }) => {
    const dto = plainToInstance(PaginationQueryDto, input);
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === field)).toBe(true);
  });

  it('should fail when order is an invalid enum value', async () => {
    const dto = plainToInstance(PaginationQueryDto, { order: 'RANDOM' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'order')).toBe(true);
  });

  it('should accept both valid SortBy enum values', async () => {
    for (const order of [SortBy.ASC, SortBy.DESC]) {
      const dto = plainToInstance(PaginationQueryDto, { order });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    }
  });
});
