export abstract class BaseRepository<T extends { id: string }> {
  abstract findAll(): T[];

  abstract findById(id: T['id']): T | undefined;

  abstract create(entity: T): T;

  abstract update(id: T['id'], data: Partial<T>): T | undefined;

  abstract delete(id: T['id']): boolean;
}
