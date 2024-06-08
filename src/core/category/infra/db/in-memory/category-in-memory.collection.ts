import { InMemoryCollection } from '@core/@shared/infra/db/in-memory/in-memory.collection';
import { SearchParams } from '../../../../@shared/domain/repository/search-params';
import { Category } from '../../../domain/category.aggregate';

export class CategoryInMemoryCollection extends InMemoryCollection<
  Category,
  string
> {
  applyFilter(
    params: SearchParams<string>,
  ): InMemoryCollection<Category, string> {
    const Collection = this.getCollection();
    const { filter } = params;
    return new Collection(
      !filter
        ? this.items
        : this.items.filter((i) =>
            i.name.toLowerCase().includes(filter.toLowerCase()),
          ),
    );
  }

  applySort(
    params: SearchParams<string>,
    getterFn?: (sort: string, item: Category) => any,
  ): InMemoryCollection<Category, string> {
    return params.sort
      ? super.applySort(params, getterFn)
      : super.applySort(
          new SearchParams({ ...params, sort: 'created_at', sort_dir: 'desc' }),
        );
  }

  getCollection(): new (
    ...args: any[]
  ) => InMemoryCollection<Category, string> {
    return CategoryInMemoryCollection;
  }
}
