import { BaseRepository } from './base.repository';

export class InMemoryBaseRepository<
  T extends { id: string },
> extends BaseRepository<T> {
  private storage = new Map<T['id'], T>();

  constructor(private readonly entityClass: new () => T) {
    super();
  }

  private toEntity(data: any): T {
    return Object.assign(new this.entityClass(), data);
  }

  async findAll() {
    return Array.from(this.storage.values()).map((entity) =>
      this.toEntity(entity),
    );
  }

  async findById(id: T['id']) {
    const entity = this.storage.get(id);
    return entity ? this.toEntity(entity) : undefined;
  }

  async findBy(filter: Partial<T>): Promise<T | undefined> {
    for (const entity of this.storage.values()) {
      const match = Object.entries(filter).every(
        ([key, value]) => entity[key] === value,
      );
      if (match) return this.toEntity(entity);
    }
    return undefined;
  }

  async create(entity: T) {
    const newEntity = this.toEntity(entity);
    this.storage.set(entity.id, newEntity);
    return newEntity;
  }

  async update(id: T['id'], data: Partial<T>) {
    const entity = this.storage.get(id);

    if (!entity) {
      return undefined;
    }

    Object.assign(entity, data);
    return this.toEntity(entity);
  }

  async delete(id: T['id']) {
    return this.storage.delete(id);
  }
}
