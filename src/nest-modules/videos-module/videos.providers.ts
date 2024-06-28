import { IUnitOfWork } from '@core/@shared/domain/repository/unit-of-work.interface';
import { UnitOfWorkSequelize } from '@core/@shared/infra/db/sequelize/unit-of-work-sequelize';
import { CastMembersIdExistsInDatabaseValidator } from '@core/cast-member/application/validations/cast-members-id-exists-in-database.validator';
import { CategoriesIdExistsInStorageValidator } from '@core/category/application/validations/categories-ids-exists-in-storage';
import { GenresIdExistsInDatabaseValidator } from '@core/genre/application/validations/genres-id-exists-in-database.validator';
import { CreateVideoUseCase } from '@core/video/application/use-cases/create-video/create-video.use-case';
import { IVideoRepository } from '@core/video/domain/video.repository';
import { VideoInMemoryRepository } from '@core/video/infra/db/in-memory/video-in-memory.repository';
import { VideoSequelizeRepository } from '@core/video/infra/db/sequelize/video-sequelize.repository';
import { VideoModel } from '@core/video/infra/db/sequelize/video.model';
import { getModelToken } from '@nestjs/sequelize';
import { CATEGORY_PROVIDERS } from '../categories-module/categories.providers';
import { GENRES_PROVIDERS } from '../genres-module/genres.providers';
import { CAST_MEMBERS_PROVIDERS } from '../cast-members-module/cast-members.providers';
import { UpdateVideoUseCase } from '@core/video/application/use-cases/update-video/update-video.use-case';
import { UploadAudioVideoMediasUseCase } from '@core/video/application/use-cases/upload-audio-video-medias/upload-audio-video-medias.use-case';
import { IStorage } from '@core/@shared/application/storage.interface';
import { ApplicationService } from '@core/@shared/application/application.service';
import { GetVideoUseCase } from '@core/video/application/use-cases/get-video/get-video.use-case';
import { ICategoryRepository } from '@core/category/domain/category.repository';
import { ICastMemberRepository } from '@core/cast-member/domain/cast-member.repository';
import { IGenreRepository } from '@core/genre/domain/genre.repository';
import { ProcessAudioVideoMediasUseCase } from '@core/video/application/use-cases/process-audio-video-medias/process-audio-video-medias.use-case';

export const REPOSITORIES = {
  VIDEO_REPOSITORY: {
    provide: 'VideoRepository',
    useExisting: VideoSequelizeRepository,
  },
  VIDEO_IN_MEMORY_REPOSITORY: {
    provide: VideoInMemoryRepository,
    useClass: VideoInMemoryRepository,
  },
  VIDEO_SEQUELIZE_REPOSITORY: {
    provide: VideoSequelizeRepository,
    inject: [getModelToken(VideoModel), 'UnitOfWork'],
    useFactory(model: typeof VideoModel, uow: UnitOfWorkSequelize) {
      return new VideoSequelizeRepository(model, uow);
    },
  },
};

export const USE_CASES = {
  CREATE_VIDEO_USE_CASE: {
    provide: CreateVideoUseCase,
    // prettier-ignore
    inject: [
      'UnitOfWork',
      REPOSITORIES.VIDEO_REPOSITORY.provide,
      CATEGORY_PROVIDERS.VALIDATIONS.CATEGORIES_IDS_EXISTS_IN_STORAGE_VALIDATOR.provide,
      GENRES_PROVIDERS.VALIDATIONS.GENRES_IDS_EXISTS_IN_DATABASE_VALIDATOR.provide,
      CAST_MEMBERS_PROVIDERS.VALIDATIONS.CAST_MEMBERS_IDS_EXISTS_IN_DATABASE_VALIDATOR.provide,
    ],
    useFactory(
      uow: IUnitOfWork,
      videoRepo: IVideoRepository,
      categoriesIdValidator: CategoriesIdExistsInStorageValidator,
      genresIdValidator: GenresIdExistsInDatabaseValidator,
      castMembersIdValidator: CastMembersIdExistsInDatabaseValidator,
    ) {
      return new CreateVideoUseCase(
        uow,
        videoRepo,
        categoriesIdValidator,
        genresIdValidator,
        castMembersIdValidator,
      );
    },
  },
  UPDATE_VIDEO_USE_CASE: {
    provide: UpdateVideoUseCase,
    // prettier-ignore
    inject: [
      'UnitOfWork',
      REPOSITORIES.VIDEO_REPOSITORY.provide,
      CATEGORY_PROVIDERS.VALIDATIONS.CATEGORIES_IDS_EXISTS_IN_STORAGE_VALIDATOR.provide,
      GENRES_PROVIDERS.VALIDATIONS.GENRES_IDS_EXISTS_IN_DATABASE_VALIDATOR.provide,
      CAST_MEMBERS_PROVIDERS.VALIDATIONS.CAST_MEMBERS_IDS_EXISTS_IN_DATABASE_VALIDATOR.provide,
    ],
    useFactory(
      uow: IUnitOfWork,
      videoRepo: IVideoRepository,
      categoriesIdValidator: CategoriesIdExistsInStorageValidator,
      genresIdValidator: GenresIdExistsInDatabaseValidator,
      castMembersIdValidator: CastMembersIdExistsInDatabaseValidator,
    ) {
      return new UpdateVideoUseCase(
        uow,
        videoRepo,
        categoriesIdValidator,
        genresIdValidator,
        castMembersIdValidator,
      );
    },
  },
  UPLOAD_AUDIO_VIDEO_MEDIA_USE_CASE: {
    provide: UploadAudioVideoMediasUseCase,
    inject: [
      ApplicationService,
      REPOSITORIES.VIDEO_REPOSITORY.provide,
      'Storage',
    ],
    useFactory(
      appService: ApplicationService,
      videoRepo: IVideoRepository,
      storage: IStorage,
    ) {
      return new UploadAudioVideoMediasUseCase(appService, videoRepo, storage);
    },
  },
  GET_VIDEO_USE_CASE: {
    provide: GetVideoUseCase,
    inject: [
      REPOSITORIES.VIDEO_REPOSITORY.provide,
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
      GENRES_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide,
      CAST_MEMBERS_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
    ],
    useFactory(
      videoRepo: IVideoRepository,
      categoryRepo: ICategoryRepository,
      genreRepo: IGenreRepository,
      castMemberRepo: ICastMemberRepository,
    ) {
      return new GetVideoUseCase(
        videoRepo,
        categoryRepo,
        genreRepo,
        castMemberRepo,
      );
    },
  },
  PROCESS_AUDIO_VIDEO_MEDIAS_USE_CASE: {
    provide: ProcessAudioVideoMediasUseCase,
    inject: ['UnitOfWork', REPOSITORIES.VIDEO_REPOSITORY.provide],
    useFactory(uow: IUnitOfWork, videoRepo: IVideoRepository) {
      return new ProcessAudioVideoMediasUseCase(uow, videoRepo);
    },
  },
};

export const VIDEOS_PROVIDERS = {
  REPOSITORIES,
  USE_CASES,
};
