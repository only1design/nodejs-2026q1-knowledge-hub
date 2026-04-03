import { PaginationQueryDto } from './pagination-query.dto';

export function paginate<T>(items: T[], query: PaginationQueryDto) {
  if (!query.page && !query.limit) {
    return items;
  }

  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  const start = (page - 1) * limit;

  return {
    data: items.slice(start, start + limit),
    page,
    limit,
    total: items.length,
  };
}
