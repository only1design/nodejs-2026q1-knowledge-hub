import { InMemoryBaseRepository } from './base-memory.repository';

class TestEntity {
  id: string;
  name: string;
}

class TestRepository extends InMemoryBaseRepository<TestEntity> {
  constructor() {
    super(TestEntity);
  }
}

describe('InMemoryBaseRepository', () => {
  let repository: TestRepository;

  const entity: TestEntity = { id: '1', name: 'test' };

  beforeEach(() => {
    repository = new TestRepository();
  });

  describe('create', () => {
    it('should return created entity', async () => {
      const result = await repository.create(entity);

      expect(result).toEqual(entity);
    });

    it('should return an instance of entity class', async () => {
      const result = await repository.create(entity);

      expect(result).toBeInstanceOf(TestEntity);
    });
  });

  describe('findAll', () => {
    it('should return empty array when no entities', async () => {
      expect(await repository.findAll()).toEqual([]);
    });

    it('should return all created entities', async () => {
      const entity2: TestEntity = { id: '2', name: 'test2' };
      await repository.create(entity);
      await repository.create(entity2);

      expect(await repository.findAll()).toEqual([entity, entity2]);
    });
  });

  describe('findById', () => {
    it('should return entity by id', async () => {
      await repository.create(entity);

      expect(await repository.findById('1')).toEqual(entity);
    });

    it('should return undefined for non-existent id', async () => {
      expect(await repository.findById('999')).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should update and return entity', async () => {
      await repository.create(entity);

      const result = await repository.update('1', { name: 'updated' });

      expect(result).toEqual({ id: '1', name: 'updated' });
    });

    it('should return undefined for non-existent id', async () => {
      expect(
        await repository.update('999', { name: 'updated' }),
      ).toBeUndefined();
    });

    it('should persist changes', async () => {
      await repository.create(entity);
      await repository.update('1', { name: 'updated' });

      expect((await repository.findById('1')).name).toBe('updated');
    });
  });

  describe('delete', () => {
    it('should return true when entity deleted', async () => {
      await repository.create(entity);

      expect(await repository.delete('1')).toBe(true);
    });

    it('should return false for non-existent id', async () => {
      expect(await repository.delete('999')).toBe(false);
    });

    it('should remove entity from storage', async () => {
      await repository.create(entity);
      await repository.delete('1');

      expect(await repository.findById('1')).toBeUndefined();
    });
  });
});
