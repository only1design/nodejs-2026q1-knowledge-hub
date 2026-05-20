export abstract class BaseRepository<T extends { id: string }> {
  abstract findAll(): Promise<T[]>;

  abstract findById(id: T['id']): Promise<T | undefined>;

  abstract findBy(entity: Partial<T>): Promise<T | undefined>;

  abstract create(entity: T): Promise<T>;

  abstract update(id: T['id'], data: Partial<T>): Promise<T | undefined>;

  abstract delete(id: T['id']): Promise<boolean>;
}
