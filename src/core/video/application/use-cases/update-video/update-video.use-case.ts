import { IUseCase } from '@core/@shared/application/use-case.interface';
import { EntityValidationError } from '@core/@shared/domain/errors/validation.error';
import { IUnitOfWork } from '@core/@shared/domain/repository/unit-of-work.interface';
import { CastMembersIdExistsInDatabaseValidator } from '@core/cast-member/application/validations/cast-members-id-exists-in-database.validator';
import { GenresIdExistsInDatabaseValidator } from '@core/genre/application/validations/genres-id-exists-in-database.validator';
import { Rating } from '@core/video/domain/rating.vo';
import { VideoId } from '@core/video/domain/video-id.vo';
import { Video } from '@core/video/domain/video.aggregate';
import { IVideoRepository } from '@core/video/domain/video.repository';
import { UpdateVideoInput } from './update-video.input';
import { CategoriesIdExistsInStorageValidator } from '@core/category/application/validations/categories-ids-exists-in-storage';
import { NotFoundError } from '@core/@shared/domain/errors/not-found.error';

export class UpdateVideoUseCase
  implements IUseCase<UpdateVideoInput, UpdateVideoOutput>
{
  constructor(
    private uow: IUnitOfWork,
    private videoRepo: IVideoRepository,
    private categoriesIdValidator: CategoriesIdExistsInStorageValidator,
    private genresIdValidator: GenresIdExistsInDatabaseValidator,
    private castMembersIdValidator: CastMembersIdExistsInDatabaseValidator,
  ) {}

  async execute(input: UpdateVideoInput): Promise<UpdateVideoOutput> {
    const videoId = new VideoId(input.id);
    const video = await this.videoRepo.findById(videoId);

    if (!video) {
      throw new NotFoundError(input.id, Video);
    }

    input.title && video.changeTitle(input.title);
    input.description && video.changeDescription(input.description);
    input.year_launched && video.changeYearLaunched(input.year_launched);
    input.duration && video.changeDuration(input.duration);

    if (input.rating) {
      const eitherRating = Rating.create(input.rating);

      eitherRating.isOk() && video.changeRating(eitherRating.ok);

      eitherRating.isFail() &&
        video.notification.setError(eitherRating.error.message, 'type');
    }

    if (input.is_opened === true) {
      video.markAsOpened();
    }

    if (input.is_opened === false) {
      video.markAsNotOpened();
    }

    const notification = video.notification;

    if (input.categories_id) {
      const eitherCategoriesId = await this.categoriesIdValidator.validate(
        input.categories_id,
      );

      eitherCategoriesId.isOk() &&
        video.syncCategoriesId(eitherCategoriesId.ok);

      eitherCategoriesId.isFail() &&
        notification.setError(
          eitherCategoriesId.error.map((e) => e.message),
          'categories_id',
        );
    }

    if (input.genres_id) {
      const eitherGenresId = await this.genresIdValidator.validate(
        input.genres_id,
      );

      eitherGenresId.isOk() && video.syncGenresId(eitherGenresId.ok);

      eitherGenresId.isFail() &&
        notification.setError(
          eitherGenresId.error.map((e) => e.message),
          'genres_id',
        );
    }

    if (input.cast_members_id) {
      const eitherCastMembersId = await this.castMembersIdValidator.validate(
        input.cast_members_id,
      );

      eitherCastMembersId.isOk() &&
        video.syncCastMembersId(eitherCastMembersId.ok);

      eitherCastMembersId.isFail() &&
        notification.setError(
          eitherCastMembersId.error.map((e) => e.message),
          'cast_members_id',
        );
    }

    if (video.notification.hasErrors()) {
      throw new EntityValidationError(video.notification.toJSON());
    }

    await this.uow.do(async () => {
      return this.videoRepo.update(video);
    });

    return { id: video.video_id.value };
  }
}

export type UpdateVideoOutput = { id: string };
