import { paginate } from './paginate';
import { SortBy } from './pagination-query.dto';

const items = [
  { id: '1', name: 'Charlie', age: 30 },
  { id: '2', name: 'Alice', age: 25 },
  { id: '3', name: 'Bob', age: 35 },
  { id: '4', name: 'Dave', age: null },
];

describe('paginate', () => {
  describe('without pagination params', () => {
    it('should return all items as array', () => {
      const result = paginate(items, {});

      expect(result).toEqual(items);
    });
  });

  describe('pagination', () => {
    it('should return first page', () => {
      const result = paginate(items, { page: 1, limit: 2 });

      expect(result).toEqual({
        data: [items[0], items[1]],
        page: 1,
        limit: 2,
        total: 4,
      });
    });

    it('should return second page', () => {
      const result = paginate(items, { page: 2, limit: 2 });

      expect(result).toEqual({
        data: [items[2], items[3]],
        page: 2,
        limit: 2,
        total: 4,
      });
    });

    it('should return empty data for page beyond total', () => {
      const result = paginate(items, { page: 5, limit: 2 });

      expect(result).toEqual({
        data: [],
        page: 5,
        limit: 2,
        total: 4,
      });
    });

    it('should default page to 1 when only limit is provided', () => {
      const result = paginate(items, { limit: 2 });

      expect(result).toEqual({
        data: [items[0], items[1]],
        page: 1,
        limit: 2,
        total: 4,
      });
    });

    it('should default limit to 10 when only page is provided', () => {
      const result = paginate(items, { page: 1 });

      expect(result).toEqual({
        data: items,
        page: 1,
        limit: 10,
        total: 4,
      });
    });
  });

  describe('sorting', () => {
    it('should sort by field ascending', () => {
      const result = paginate(items, { sortBy: 'name' }) as typeof items;

      expect(result.map((i) => i.name)).toEqual([
        'Alice',
        'Bob',
        'Charlie',
        'Dave',
      ]);
    });

    it('should sort by field descending', () => {
      const result = paginate(items, {
        sortBy: 'name',
        order: SortBy.DESC,
      }) as typeof items;

      expect(result.map((i) => i.name)).toEqual([
        'Dave',
        'Charlie',
        'Bob',
        'Alice',
      ]);
    });

    it('should sort numbers with nulls to the end (asc)', () => {
      const result = paginate(items, {
        sortBy: 'age',
        order: SortBy.ASC,
      }) as typeof items;

      expect(result.map((i) => i.age)).toEqual([25, 30, 35, null]);
    });

    it('should sort numbers with nulls to the end (desc)', () => {
      const result = paginate(items, {
        sortBy: 'age',
        order: SortBy.DESC,
      }) as typeof items;

      expect(result.map((i) => i.age)).toEqual([35, 30, 25, null]);
    });
  });

  describe('sorting + pagination', () => {
    it('should sort before paginating', () => {
      const result = paginate(items, {
        sortBy: 'name',
        order: SortBy.ASC,
        page: 1,
        limit: 2,
      });

      expect(result).toEqual({
        data: [
          { id: '2', name: 'Alice', age: 25 },
          { id: '3', name: 'Bob', age: 35 },
        ],
        page: 1,
        limit: 2,
        total: 4,
      });
    });
  });

  describe('equal values', () => {
    it('should preserve relative order for items with equal sort values', () => {
      const equalItems = [
        { id: '1', name: 'Alice', age: 25 },
        { id: '2', name: 'Alice', age: 30 },
      ];
      const result = paginate(equalItems, {
        sortBy: 'name',
      }) as typeof equalItems;

      expect(result.map((i) => i.id)).toEqual(['1', '2']);
    });
  });

  describe('immutability', () => {
    it('should not mutate the original array', () => {
      const original = [...items];
      paginate(items, { sortBy: 'name' });

      expect(items).toEqual(original);
    });
  });
});
