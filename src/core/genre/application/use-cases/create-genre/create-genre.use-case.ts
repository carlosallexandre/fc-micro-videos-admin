import { IUseCase } from '@core/@shared/application/use-case.interface';
import { GenreOutput, GenreOutputMapper } from '../common/genre-output.mapper';
import { CreateGenreInput } from './create-genre.input';
import { IGenreRepository } from '@core/genre/domain/genre.repository';
import { ICategoryRepository } from '@core/category/domain/category.repository';
import { Notification } from '@core/@shared/domain/notification';
import { CategoriesIdExistsInStorageValidator } from '@core/category/application/validations/categories-ids-exists-in-storage';
import { NotFoundError } from '@core/@shared/domain/errors/not-found.error';
import { Genre } from '@core/genre/domain/genre.aggregate';
import { EntityValidationError } from '@core/@shared/domain/errors/validation.error';
import { IUnitOfWork } from '@core/@shared/domain/repository/unit-of-work.interface';

export type CreateGenreOutput = GenreOutput;

export class CreateGenreUseCase
  implements IUseCase<CreateGenreInput, CreateGenreOutput>
{
  constructor(
    private readonly uow: IUnitOfWork,
    private readonly genreRepo: IGenreRepository,
    private readonly categoryRepo: ICategoryRepository,
    private readonly categoriesIdExistsInStorageValidator: CategoriesIdExistsInStorageValidator,
  ) {}

  async execute(input: CreateGenreInput): Promise<GenreOutput> {
    const notification = new Notification();

    const categoriesIdResult =
      await this.categoriesIdExistsInStorageValidator.validate(
        input.categories_id,
      );

    if (categoriesIdResult.isFail()) {
      notification.setError(
        categoriesIdResult.error.map((e) => e.message),
        'categories_id',
      );
    }

    const genre = Genre.create({
      name: input.name,
      is_active: input.is_active,
      categories_id: categoriesIdResult.ok ?? [],
    });

    notification.copyErrors(genre.notification);

    if (notification.hasErrors()) {
      throw new EntityValidationError(notification.toJSON());
    }

    await this.uow.do(() => this.genreRepo.insert(genre));

    const categories = await this.categoryRepo.findByIds(categoriesIdResult.ok);

    return GenreOutputMapper.toOutput(genre, categories);
  }
}
