import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Prisma } from '../../generated/prisma/client';
import { BaseRepository } from './base.repository';

export class DbBaseRepository<T extends { id: string }>
  implements BaseRepository<T>
{
  constructor(
    protected readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
    private readonly modelName: Prisma.ModelName,
    private readonly entityClass: new () => T,
  ) {}

  protected get model() {
    return this.txHost.tx[this.modelName];
  }

  protected toEntity(data: any): T {
    return Object.assign(new this.entityClass(), data);
  }

  async create(entity: T): Promise<T> {
    return this.toEntity(await this.model.create({ data: entity }));
  }

  async delete(id: T['id']): Promise<boolean> {
    try {
      await this.model.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async findAll(): Promise<T[]> {
    const results = await this.model.findMany();
    return results.map((result) => this.toEntity(result));
  }

  async findById(id: T['id']): Promise<T | undefined> {
    const result = await this.model.findFirst({ where: { id } });
    return result ? this.toEntity(result) : undefined;
  }

  async update(id: T['id'], data: Partial<T>): Promise<T | undefined> {
    return this.toEntity(await this.model.update({ where: { id }, data }));
  }
}
