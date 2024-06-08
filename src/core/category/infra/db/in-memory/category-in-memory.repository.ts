import { InMemoryRepository } from '@core/@shared/infra/db/in-memory/in-memory.repository';
import { Uuid } from '../../../../@shared/domain/value-objects/uuid.vo';
import { Category } from '../../../domain/category.entity';
import { CategoryInMemoryCollection } from './category-in-memory.collection';

export class CategoryInMemoryRepository<
  F extends string = string,
> extends InMemoryRepository<Category, Uuid, F> {
  collection: CategoryInMemoryCollection = new CategoryInMemoryCollection([]);

  getEntity(): new (...args: any[]) => Category {
    return Category;
  }
}
