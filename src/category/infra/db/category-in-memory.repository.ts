import { Uuid } from "../../../@shared/domain/value-objects/uuid.vo";
import { InMemoryRepository } from "../../../@shared/infra/db/in-memory.repository";
import { Category } from "../../domain/category.entity";
import { CategoryInMemoryCollection } from "./category-in-memory.collection";

export class CategoryInMemoryRepository<F = string> extends InMemoryRepository<
  Category,
  Uuid,
  F
> {
  collection: CategoryInMemoryCollection<Category, F> =
    new CategoryInMemoryCollection([]);

  getEntity(): new (...args: any[]) => Category {
    return Category;
  }
}
