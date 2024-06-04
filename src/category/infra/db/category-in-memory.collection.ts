import { SearchParams } from "../../../@shared/domain/repository/search-params";
import { InMemoryCollection } from "../../../@shared/infra/db/in-memory.collection";

export class CategoryInMemoryCollection<E, F> extends InMemoryCollection<E, F> {
  applyFilter(params: SearchParams<F>): InMemoryCollection<E, F> {
    throw new Error("Method not implemented.");
  }

  getCollection(): new (...args: any[]) => InMemoryCollection<E, F> {
    return CategoryInMemoryCollection;
  }
}
