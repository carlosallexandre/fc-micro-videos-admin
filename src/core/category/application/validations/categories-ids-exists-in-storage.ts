import { Either } from '@core/@shared/domain/either';
import { NotFoundError } from '@core/@shared/domain/errors/not-found.error';
import { CategoryId } from '@core/category/domain/category-id.vo';
import { Category } from '@core/category/domain/category.aggregate';
import { ICategoryRepository } from '@core/category/domain/category.repository';

export class CategoriesIdExistsInStorageValidator {
  constructor(private readonly categoryRepo: ICategoryRepository) {}

  async validate(
    categories_id: string[],
  ): Promise<Either<NotFoundError[], CategoryId[]>> {
    const categoriesId = categories_id.map((id) => new CategoryId(id));

    const result = await this.categoryRepo.existsById(categoriesId);

    return result.not_exists.length > 0
      ? Either.fail(
          result.not_exists.map((id) => new NotFoundError(id, Category)),
        )
      : Either.ok(result.exists);
  }
}
