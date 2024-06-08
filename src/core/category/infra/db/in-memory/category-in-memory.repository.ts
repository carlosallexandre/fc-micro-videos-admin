import { InMemoryRepository } from '@core/@shared/infra/db/in-memory/in-memory.repository';
import { Category } from '../../../domain/category.aggregate';
import { CategoryInMemoryCollection } from './category-in-memory.collection';
import { CategoryId } from '@core/category/domain/category-id.vo';

export class CategoryInMemoryRepository<
  F extends string = string,
> extends InMemoryRepository<Category, CategoryId, F> {
  collection: CategoryInMemoryCollection = new CategoryInMemoryCollection([]);

  getEntity(): new (...args: any[]) => Category {
    return Category;
  }
}
