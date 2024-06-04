import { SearchParams } from "../../domain/repository/search-params";

export abstract class InMemoryCollection<E, F> extends Array<E> {
  public items: E[];

  constructor(items: E[]) {
    super();
    this.items = items;
  }

  abstract applyFilter(params: SearchParams<F>): InMemoryCollection<E, F>;

  abstract getCollection(): new (...args: any[]) => InMemoryCollection<E, F>;

  applySort(
    params: SearchParams<F>,
    // @ts-ignore
    getterFn: (sort: string, item: E) => any = (sort, item) => item[sort]
  ): InMemoryCollection<E, F> {
    const Collection = this.getCollection();
    const { sort, sort_dir } = params;
    let itemsToSort = [...this.items];

    return new Collection(
      !sort
        ? itemsToSort
        : itemsToSort.sort((a, b) =>
            sort_dir === "asc"
              ? getterFn(sort, a) - getterFn(sort, b)
              : getterFn(sort, b) - getterFn(sort, a)
          )
    );
  }

  applyPaginate({ page, per_page }: SearchParams<F>): InMemoryCollection<E, F> {
    const Collection = this.getCollection();

    const start = (page - 1) * per_page;
    const limit = start + per_page;

    const itemsToPaginate = [...this.items];
    itemsToPaginate.splice(start, limit);

    return new Collection(itemsToPaginate);
  }
}
