import { PaginationQueryDto, SortBy } from './pagination-query.dto';

const compare = (a: unknown, b: unknown): number => {
  if (a == null) return 1;
  if (b == null) return -1;
  if (a < b) return -1;
  if (a > b) return 1;

  return 0;
};

const sort = <T>(items: T[], sortBy: string, order: SortBy): T[] => {
  const direction = order === SortBy.DESC ? -1 : 1;

  return [...items].sort((a, b) => {
    const valA = a[sortBy];
    const valB = b[sortBy];

    if (valA == null) return 1;
    if (valB == null) return -1;

    return direction * compare(valA, valB);
  });
};

export const paginate = <T>(items: T[], query: PaginationQueryDto) => {
  let result = items;

  if (query.sortBy) {
    result = sort(result, query.sortBy, query.order ?? SortBy.ASC);
  }

  if (!query.page && !query.limit) {
    return result;
  }

  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  const start = (page - 1) * limit;

  return {
    data: result.slice(start, start + limit),
    page,
    limit,
    total: result.length,
  };
};
