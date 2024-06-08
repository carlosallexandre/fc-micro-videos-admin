import { Entity } from '@core/@shared/domain/entity';
import { IRepository } from '@core/@shared/domain/repository/repository.interface';
import { SearchParams } from '@core/@shared/domain/repository/search-params';
import { SearchResult } from '@core/@shared/domain/repository/search-result';
import { ISearchableRepository } from '@core/@shared/domain/repository/searchable-repository.interface';
import { ValueObject } from '@core/@shared/domain/value-objects/value-object';
import { NotFoundError } from '@core/@shared/domain/errors/not-found.error';
import { InMemoryCollection } from './in-memory.collection';

export abstract class InMemoryRepository<
    E extends Entity,
    EntityId extends ValueObject,
    F = string,
  >
  implements IRepository<E, EntityId>, ISearchableRepository<E, F>
{
  abstract collection: InMemoryCollection<E, F>;

  get items() {
    return this.collection.items;
  }

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

  protected getIndexOf(entity_id: EntityId): number {
    const index = this.items.findIndex((item) => item.id.equals(entity_id));
    if (index === -1) throw new NotFoundError(entity_id, this.getEntity());
    return index;
  }

  async findAll(): Promise<E[]> {
    return this.items;
  }

  abstract getEntity(): new (...args: any[]) => E;

  async search(props: SearchParams<F>): Promise<SearchResult<E>> {
    const itemsFiltered = this.collection.applyFilter(props);

    return new SearchResult({
      items: itemsFiltered.applySort(props).applyPaginate(props).items,
      total: itemsFiltered.items.length,
      current_page: props.page,
      per_page: props.per_page,
    });
  }
}
