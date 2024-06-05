import { SearchParams } from "../../domain/repository/search-params";

export abstract class InMemoryCollection<E, F> {
  items: E[] = [];

  constructor(items: E[] = []) {
    this.items.push(...items);
  }

  abstract applyFilter(params: SearchParams<F>): InMemoryCollection<E, F>;

  abstract getCollection(): new (...args: any[]) => InMemoryCollection<E, F>;

  applySort(
    params: SearchParams<F>,
    // @ts-ignore
    getterFn: (sort: string, item: E) => any = (sort, item) => item[sort]
  ): InMemoryCollection<E, F> {
    console.log(params);

    const Collection = this.getCollection();
    const { sort, sort_dir } = params;
    let itemsToSort = [...this.items];

    if (sort) {
      itemsToSort.sort((a, b) => {
        const aValue = getterFn(sort, a);
        const bValue = getterFn(sort, b);

        if (aValue < bValue) return sort_dir === "asc" ? -1 : 1;
        if (aValue > bValue) return sort_dir === "asc" ? 1 : -1;
        return 0;
      });
    }

    return new Collection(itemsToSort);
  }

  applyPaginate({ page, per_page }: SearchParams<F>): InMemoryCollection<E, F> {
    const Collection = this.getCollection();

    const start = (page - 1) * per_page;
    const limit = start + per_page;

    const itemsToPaginate = [...this.items];
    const itemsPaginated = itemsToPaginate.splice(start, limit);

    return new Collection(itemsPaginated);
  }
}
