import { IUseCase } from '@core/@shared/application/use-case.interface';
import { EntityValidationError } from '@core/@shared/domain/errors/validation.error';
import { IUnitOfWork } from '@core/@shared/domain/repository/unit-of-work.interface';
import { CastMembersIdExistsInDatabaseValidator } from '@core/cast-member/application/validations/cast-members-id-exists-in-database.validator';
import { CategoriesIdExistsInStorageValidator } from '@core/category/application/validations/categories-ids-exists-in-storage';
import { GenresIdExistsInDatabaseValidator } from '@core/genre/application/validations/genres-id-exists-in-database.validator';
import { Rating } from '@core/video/domain/rating.vo';
import { Video } from '@core/video/domain/video.aggregate';
import { IVideoRepository } from '@core/video/domain/video.repository';
import { CreateVideoInput } from './create-video.input';

export class CreateVideoUseCase
  implements IUseCase<CreateVideoInput, CreateVideoOutput>
{
  constructor(
    private uow: IUnitOfWork,
    private videoRepo: IVideoRepository,
    private categoriesIdValidator: CategoriesIdExistsInStorageValidator,
    private genresIdValidator: GenresIdExistsInDatabaseValidator,
    private castMembersIdValidator: CastMembersIdExistsInDatabaseValidator,
  ) {}

  async execute(input: CreateVideoInput): Promise<CreateVideoOutput> {
    const eitherRating = Rating.create(input.rating);

    const [eitherCategoriesId, eitherGenresId, eitherCastMembersId] =
      await Promise.all([
        await this.categoriesIdValidator.validate(input.categories_id),
        await this.genresIdValidator.validate(input.genres_id),
        await this.castMembersIdValidator.validate(input.cast_members_id),
      ]);

    const video = Video.create({
      ...input,
      rating: eitherRating.ok,
      categories_id: eitherCategoriesId.ok ?? [],
      genres_id: eitherGenresId.ok ?? [],
      cast_members_id: eitherCastMembersId.ok ?? [],
    });

    const notification = video.notification;

    if (eitherCategoriesId.isFail()) {
      notification.setError(
        eitherCategoriesId.error.map((e) => e.message),
        'categories_id',
      );
    }

    if (eitherGenresId.isFail()) {
      notification.setError(
        eitherGenresId.error.map((e) => e.message),
        'genres_id',
      );
    }

    if (eitherCastMembersId.isFail()) {
      notification.setError(
        eitherCastMembersId.error.map((e) => e.message),
        'cast_members_id',
      );
    }

    if (eitherRating.isFail()) {
      notification.setError(eitherRating.error.message, 'rating');
    }

    if (notification.hasErrors()) {
      throw new EntityValidationError(notification.toJSON());
    }

    await this.uow.do(async () => {
      return this.videoRepo.insert(video);
    });

    return { id: video.video_id.value };
  }
}

export type CreateVideoOutput = { id: string };
