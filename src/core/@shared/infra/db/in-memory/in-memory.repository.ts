import { Entity } from '@core/@shared/domain/entity';
import { IRepository } from '@core/@shared/domain/repository/repository.interface';
import { ValueObject } from '@core/@shared/domain/value-objects/value-object';
import { NotFoundError } from '@core/@shared/domain/errors/not-found.error';
import { InvalidArgumentError } from '@core/@shared/domain/errors/invalid-argument-error';

export abstract class InMemoryRepository<
  E extends Entity,
  EntityId extends ValueObject,
> implements IRepository<E, EntityId>
{
  items: E[] = [];

  async insert(entity: E): Promise<void> {
    this.items.push(entity);
  }

  async bulkInsert(entities: E[]): Promise<void> {
    this.items.push(...entities);
  }

  async update(entity: E): Promise<void> {
    const index = this.getIndexOf(entity.id as EntityId);
    this.items[index] = entity;
  }

  async delete(entity_id: EntityId): Promise<void> {
    const index = this.getIndexOf(entity_id);
    this.items.splice(index, 1);
  }

  async findById(entity_id: EntityId): Promise<E | null> {
    return this.items.find((i) => i.id.equals(entity_id)) ?? null;
  }

  async findByIds(ids: EntityId[]): Promise<E[]> {
    return this.items.filter((item) => {
      return ids.some((id) => item.id.equals(id));
    });
  }

  async existsById(
    ids: EntityId[],
  ): Promise<{ exists: EntityId[]; not_exists: EntityId[] }> {
    if (!ids.length) {
      throw new InvalidArgumentError(
        'ids must be an array with at least one element',
      );
    }

    if (this.items.length === 0) {
      return {
        exists: [],
        not_exists: ids,
      };
    }

    const existsId = new Set<EntityId>();
    const notExistsId = new Set<EntityId>();

    ids.forEach((id) => {
      const item = this.items.find((i) => i.id.equals(id));
      item ? existsId.add(id) : notExistsId.add(id);
    });

    return {
      exists: Array.from(existsId.values()),
      not_exists: Array.from(notExistsId.values()),
    };
  }

  protected getIndexOf(entity_id: EntityId): number {
    const index = this.items.findIndex((item) => item.id.equals(entity_id));
    if (index === -1) throw new NotFoundError(entity_id, this.getEntity());
    return index;
  }

  async findAll(): Promise<E[]> {
    return this.items;
  }

  abstract getEntity(): new (...args: any[]) => E;
}
