import { CategoryId } from '@core/category/domain/category-id.vo';
import { NotFoundError } from '../../../../@shared/domain/errors/not-found.error';
import { InvalidUuidError } from '../../../../@shared/domain/value-objects/uuid.vo';
import { Category } from '../../../domain/category.aggregate';
import { CategoryInMemoryRepository } from '../../../infra/db/in-memory/category-in-memory.repository';
import { GetCategoryUseCase } from './get-category.use-case';

describe('GetCategoryUseCase Unit Tests', () => {
  let useCase: GetCategoryUseCase;
  let repository: CategoryInMemoryRepository;

  beforeEach(() => {
    repository = new CategoryInMemoryRepository();
    useCase = new GetCategoryUseCase(repository);
  });

  it('should throws an error for invalid id', async () => {
    await expect(useCase.execute({ id: 'invalid-id' })).rejects.toThrow(
      new InvalidUuidError(),
    );
  });

  it('should throws an error when entity not found', async () => {
    const categoryId = new CategoryId();
    await expect(
      useCase.execute({ id: categoryId.toString() }),
    ).rejects.toThrow(new NotFoundError(categoryId.toString(), Category));
  });

  it('should find a category', async () => {
    const category = Category.fake().aCategory().build();
    await repository.insert(category);
    await expect(
      useCase.execute({ id: category.id.toString() }),
    ).resolves.toStrictEqual(category.toJSON());
  });
});
