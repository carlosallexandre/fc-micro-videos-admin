import { Entity } from '@core/@shared/domain/entity';
import { SearchParams } from '@core/@shared/domain/repository/search-params';
import { SearchResult } from '@core/@shared/domain/repository/search-result';
import { ValueObject } from '@core/@shared/domain/value-objects/value-object';
import { ISearchableRepository } from '@core/@shared/domain/repository/searchable-repository.interface';
import { InMemoryRepository } from './in-memory.repository';

export abstract class InMemorySearchableRepository<
    E extends Entity,
    EntityId extends ValueObject,
    F = string,
  >
  extends InMemoryRepository<E, EntityId>
  implements ISearchableRepository<E, F>
{
  async search(props: SearchParams<F>): Promise<SearchResult<E>> {
    const itemsFiltered = this.applyFilter(this.items, props);
    const itemsSorted = this.applySort(itemsFiltered, props);
    const itemsPaginated = this.applyPaginate(itemsSorted, props);

    return new SearchResult({
      items: itemsPaginated,
      total: itemsFiltered.length,
      current_page: props.page,
      per_page: props.per_page,
    });
  }

  protected abstract applyFilter(items: E[], params: SearchParams<F>): E[];

  protected applySort(
    items: E[],
    params: SearchParams<F>,
    // @ts-ignore
    getterFn: (sort: string, item: E) => any = (sort, item) => item[sort],
  ): E[] {
    const { sort, sort_dir } = params;
    const itemsToSort = [...items];

    if (sort) {
      itemsToSort.sort((a, b) => {
        const aValue = getterFn(sort, a);
        const bValue = getterFn(sort, b);

        if (aValue < bValue) return sort_dir === 'asc' ? -1 : 1;
        if (aValue > bValue) return sort_dir === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return itemsToSort;
  }

  protected applyPaginate(
    items: E[],
    { page, per_page }: SearchParams<F>,
  ): E[] {
    const start = (page - 1) * per_page;

    const itemsToPaginate = [...items];
    const itemsPaginated = itemsToPaginate.splice(start, per_page);

    return itemsPaginated;
  }
}
