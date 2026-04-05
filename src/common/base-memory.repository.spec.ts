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
    it('should return created entity', () => {
      const result = repository.create(entity);

      expect(result).toEqual(entity);
    });

    it('should return an instance of entity class', () => {
      const result = repository.create(entity);

      expect(result).toBeInstanceOf(TestEntity);
    });
  });

  describe('findAll', () => {
    it('should return empty array when no entities', () => {
      expect(repository.findAll()).toEqual([]);
    });

    it('should return all created entities', () => {
      const entity2: TestEntity = { id: '2', name: 'test2' };
      repository.create(entity);
      repository.create(entity2);

      expect(repository.findAll()).toEqual([entity, entity2]);
    });
  });

  describe('findById', () => {
    it('should return entity by id', () => {
      repository.create(entity);

      expect(repository.findById('1')).toEqual(entity);
    });

    it('should return undefined for non-existent id', () => {
      expect(repository.findById('999')).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should update and return entity', () => {
      repository.create(entity);

      const result = repository.update('1', { name: 'updated' });

      expect(result).toEqual({ id: '1', name: 'updated' });
    });

    it('should return undefined for non-existent id', () => {
      expect(repository.update('999', { name: 'updated' })).toBeUndefined();
    });

    it('should persist changes', () => {
      repository.create(entity);
      repository.update('1', { name: 'updated' });

      expect(repository.findById('1').name).toBe('updated');
    });
  });

  describe('delete', () => {
    it('should return true when entity deleted', () => {
      repository.create(entity);

      expect(repository.delete('1')).toBe(true);
    });

    it('should return false for non-existent id', () => {
      expect(repository.delete('999')).toBe(false);
    });

    it('should remove entity from storage', () => {
      repository.create(entity);
      repository.delete('1');

      expect(repository.findById('1')).toBeUndefined();
    });
  });
});
