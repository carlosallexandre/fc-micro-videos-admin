import { IRepository } from '../../@shared/domain/repository/repository.interface';
import { ISearchableRepository } from '../../@shared/domain/repository/searchable-repository.interface';
import { Uuid } from '../../@shared/domain/value-objects/uuid.vo';
import { Category } from './category.aggregate';

interface ICategoryRepository extends IRepository<Category, Uuid> {}
interface ICategoryRepository extends ISearchableRepository<Category> {}

export { ICategoryRepository };
