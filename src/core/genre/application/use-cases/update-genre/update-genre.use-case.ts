import { IUseCase } from '@core/@shared/application/use-case.interface';
import { GenreOutput, GenreOutputMapper } from '../common/genre-output.mapper';
import { UpdateGenreInput } from './update-genre.input';
import { IUnitOfWork } from '@core/@shared/domain/repository/unit-of-work.interface';
import { IGenreRepository } from '@core/genre/domain/genre.repository';
import { ICategoryRepository } from '@core/category/domain/category.repository';
import { GenreId } from '@core/genre/domain/genre-id.vo';
import { NotFoundError } from '@core/@shared/domain/errors/not-found.error';
import { Genre } from '@core/genre/domain/genre.aggregate';
import { Notification } from '@core/@shared/domain/notification';
import { CategoriesIdExistsInStorageValidator } from '@core/category/application/validations/categories-ids-exists-in-storage';
import { EntityValidationError } from '@core/@shared/domain/errors/validation.error';

export type UpdateGenreOutput = GenreOutput;

export class UpdateGenreUseCase
  implements IUseCase<UpdateGenreInput, UpdateGenreOutput>
{
  constructor(
    private readonly uow: IUnitOfWork,
    private readonly genreRepo: IGenreRepository,
    private readonly categoryRepo: ICategoryRepository,
    private readonly categoriesIdExistsInStorageValidator: CategoriesIdExistsInStorageValidator,
  ) {}

  async execute(input: UpdateGenreInput): Promise<GenreOutput> {
    const notification = new Notification();

    const genreId = new GenreId(input.id);
    const genre = await this.genreRepo.findById(genreId);

    if (!genre) throw new NotFoundError(genreId, Genre);

    if (input.name) genre.changeName(input.name);
    if (input.is_active === true) genre.activate();
    if (input.is_active === false) genre.deactivate();

    notification.copyErrors(genre.notification);

    if (input.categories_id) {
      const result = await this.categoriesIdExistsInStorageValidator.validate(
        input.categories_id,
      );

      result.isOk()
        ? genre.syncCategoriesId(result.ok)
        : notification.setError(
            result.error.map((e) => e.message),
            'categories_id',
          );
    }

    if (notification.hasErrors()) {
      throw new EntityValidationError(notification.toJSON());
    }

    await this.uow.do(() => this.genreRepo.update(genre));

    const categories = await this.categoryRepo.findByIds(
      Array.from(genre.categories_id.values()),
    );

    return GenreOutputMapper.toOutput(genre, categories);
  }
}
