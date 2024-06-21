import { CategoryInMemoryRepository } from '@core/category/infra/db/in-memory/category-in-memory.repository';
import { CategoryId } from '@core/category/domain/category-id.vo';
import { NotFoundError } from '@core/@shared/domain/errors/not-found.error';
import { Category } from '@core/category/domain/category.aggregate';
import { CategoriesIdExistsInStorageValidator } from './categories-ids-exists-in-storage';

describe('CategoriesIdExistsInStorageValidator', () => {
  let categoryRepo: CategoryInMemoryRepository;
  let validator: CategoriesIdExistsInStorageValidator;

  beforeEach(() => {
    categoryRepo = new CategoryInMemoryRepository();
    validator = new CategoriesIdExistsInStorageValidator(categoryRepo);
  });

  it('should return many not found error when categories id not exists in storage', async () => {
    const categoryId1 = new CategoryId();
    const categoryId2 = new CategoryId();

    const result1 = await validator.validate([
      categoryId1.toString(),
      categoryId2.toString(),
    ]);

    expect(result1.isFail()).toBeTruthy();
    expect(result1.error).toStrictEqual([
      new NotFoundError(categoryId1, Category),
      new NotFoundError(categoryId2, Category),
    ]);
  });

  it('should return many not found error when some categories id not exists in storage', async () => {
    const category1 = Category.fake().aCategory().build();
    const category2 = Category.fake().aCategory().build();
    await categoryRepo.insert(category1);

    const result = await validator.validate([
      category1.id.value,
      category2.id.value,
    ]);

    expect(result.isFail()).toBeTruthy();
    expect(result.error).toStrictEqual([
      new NotFoundError(category2.id, Category),
    ]);
  });

  it('should return a list of categories id', async () => {
    const category1 = Category.fake().aCategory().build();
    const category2 = Category.fake().aCategory().build();
    await categoryRepo.bulkInsert([category1, category2]);

    const result = await validator.validate([
      category1.id.value,
      category2.id.value,
    ]);

    expect(result.isOk()).toBeTruthy();
    expect(result.ok).toStrictEqual([category1.id, category2.id]);
  });
});
