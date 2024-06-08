import { CategoryId } from '@core/category/domain/category-id.vo';
import { NotFoundError } from '../../../../@shared/domain/errors/not-found.error';
import { InvalidUuidError } from '../../../../@shared/domain/value-objects/uuid.vo';
import { setupSequelize } from '../../../../@shared/infra/testing/helpers';
import { Category } from '../../../domain/category.aggregate';
import { CategoryModel } from '../../../infra/db/sequelize/category.model';
import { CategorySequelizeRepository } from '../../../infra/db/sequelize/category.repository';
import { GetCategoryUseCase } from './get-category.use-case';

describe('GetCategoryUseCase Integration Tests', () => {
  let useCase: GetCategoryUseCase;
  let repository: CategorySequelizeRepository;

  setupSequelize({ models: [CategoryModel] });

  beforeEach(() => {
    repository = new CategorySequelizeRepository(CategoryModel);
    useCase = new GetCategoryUseCase(repository);
  });

  it('should finds a category', async () => {
    const category = Category.fake().aCategory().build();
    await repository.insert(category);

    await expect(
      useCase.execute({ id: category.id.toString() }),
    ).resolves.toStrictEqual(category.toJSON());
  });

  it('should throws an error when entity not found', async () => {
    const categoryId = new CategoryId();
    await expect(
      useCase.execute({ id: categoryId.toString() }),
    ).rejects.toThrow(new NotFoundError(categoryId.toString(), Category));
  });

  it('should throws an error for invalid categoryId', async () => {
    await expect(
      useCase.execute({ id: 'invalid-category-id' }),
    ).rejects.toThrow(new InvalidUuidError());
  });
});
