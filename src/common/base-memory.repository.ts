import { BaseRepository } from './base.repository';

export class InMemoryBaseRepository<
  T extends { id: string },
> extends BaseRepository<T> {
  private storage = new Map<T['id'], T>();

  constructor(private readonly entityClass: new () => T) {
    super();
  }

  findAll() {
    return Array.from(this.storage.values());
  }

  findById(id: T['id']): T | undefined {
    return this.storage.get(id);
  }

  create(entity: T) {
    const newEntity = Object.assign(new this.entityClass(), entity);
    this.storage.set(entity.id, newEntity);
    return newEntity;
  }

  update(id: T['id'], data: Partial<T>) {
    const entity = this.storage.get(id);

    if (!entity) {
      return undefined;
    }

    return Object.assign(entity, data);
  }

  delete(id: T['id']) {
    return this.storage.delete(id);
  }
}
