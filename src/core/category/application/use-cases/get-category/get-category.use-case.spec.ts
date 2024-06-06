import { NotFoundError } from '../../../../@shared/domain/errors/not-found.error';
import {
  InvalidUuidError,
  Uuid,
} from '../../../../@shared/domain/value-objects/uuid.vo';
import { Category } from '../../../domain/category.entity';
import { CategoryInMemoryRepository } from '../../../infra/db/in-memory/category-in-memory.repository';
import { GetCategoryUseCase } from './get-category.use-case';

describe('GetCategoryUseCase Unit Tests', () => {
  let useCase: GetCategoryUseCase;
  let repository: CategoryInMemoryRepository;

  beforeEach(() => {
    repository = new CategoryInMemoryRepository();
    useCase = new GetCategoryUseCase(repository);
  });

  it('should throws an error for invalid uuid', async () => {
    await expect(useCase.execute({ id: 'invalid-uuid' })).rejects.toThrow(
      new InvalidUuidError(),
    );
  });

  it('should throws an error when entity not found', async () => {
    const uuid = new Uuid();
    await expect(useCase.execute({ id: uuid.toString() })).rejects.toThrow(
      new NotFoundError(uuid.toString(), Category),
    );
  });

  it('should find a category', async () => {
    const category = Category.fake().aCategory().build();
    await repository.insert(category);
    await expect(
      useCase.execute({ id: category.id.toString() }),
    ).resolves.toStrictEqual(category.toJSON());
  });
});
