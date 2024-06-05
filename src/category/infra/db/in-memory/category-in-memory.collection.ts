import { SearchParams } from "../../../../@shared/domain/repository/search-params";
import { InMemoryCollection } from "../../../../@shared/infra/db/in-memory.collection";
import { Category } from "../../../domain/category.entity";

export class CategoryInMemoryCollection extends InMemoryCollection<
  Category,
  string
> {
  applyFilter(
    params: SearchParams<string>
  ): InMemoryCollection<Category, string> {
    const Collection = this.getCollection();
    const { filter } = params;
    return new Collection(
      !filter
        ? this.items
        : this.items.filter((i) =>
            i.name.toLowerCase().includes(filter.toLowerCase())
          )
    );
  }

  applySort(
    params: SearchParams<string>,
    getterFn?: (sort: string, item: Category) => any
  ): InMemoryCollection<Category, string> {
    return params.sort
      ? super.applySort(params, getterFn)
      : super.applySort(
          new SearchParams({ ...params, sort: "created_at", sort_dir: "desc" })
        );
  }

  getCollection(): new (...args: any[]) => InMemoryCollection<
    Category,
    string
  > {
    return CategoryInMemoryCollection;
  }
}
