import { Category } from '../../../domain/category.aggregate';
import { CategoryId } from '@core/category/domain/category-id.vo';
import { SearchParams } from '@core/@shared/domain/repository/search-params';
import { InMemorySearchableRepository } from '@core/@shared/infra/db/in-memory/in-memory-searchable.repository';
import { ICategoryRepository } from '@core/category/domain/category.repository';

export class CategoryInMemoryRepository<F extends string = string>
  extends InMemorySearchableRepository<Category, CategoryId, F>
  implements ICategoryRepository
{
  getEntity(): new (...args: any[]) => Category {
    return Category;
  }

  protected applyFilter(
    items: Category[],
    params: SearchParams<F>,
  ): Category[] {
    const { filter } = params;
    return !filter
      ? items
      : items.filter((i) =>
          i.name.toLowerCase().includes(filter.toLowerCase()),
        );
  }

  protected applySort(
    items: Category[],
    params: SearchParams<F>,
    getterFn?: (sort: string, item: Category) => any,
  ): Category[] {
    return params.sort
      ? super.applySort(items, params, getterFn)
      : super.applySort(
          items,
          new SearchParams({ ...params, sort: 'created_at', sort_dir: 'desc' }),
          getterFn,
        );
  }
}
