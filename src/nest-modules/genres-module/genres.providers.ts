import { getModelToken } from '@nestjs/sequelize';
import { IUnitOfWork } from '@core/@shared/domain/repository/unit-of-work.interface';
import { UnitOfWorkSequelize } from '@core/@shared/infra/db/sequelize/unit-of-work-sequelize';
import { ICategoryRepository } from '@core/category/domain/category.repository';
import { CreateGenreUseCase } from '@core/genre/application/use-cases/create-genre/create-genre.use-case';
import { DeleteGenreUseCase } from '@core/genre/application/use-cases/delete-genre/delete-genre.use-case';
import { GetGenreUseCase } from '@core/genre/application/use-cases/get-genre/get-genre.use-case';
import { ListGenresUseCase } from '@core/genre/application/use-cases/list-genres/list-genres.use-case';
import { UpdateGenreUseCase } from '@core/genre/application/use-cases/update-genre/update-genre.use-case';
import { IGenreRepository } from '@core/genre/domain/genre.repository';
import { GenreInMemoryRepository } from '@core/genre/infra/db/in-memory/genre-in-memory.repository';
import { GenreSequelizeRepository } from '@core/genre/infra/db/sequelize/genre-sequelize.repository';
import { GenreModel } from '@core/genre/infra/db/sequelize/genre.model';
import { CATEGORY_PROVIDERS } from '../categories-module/categories.providers';
import { CategoriesIdExistsInStorageValidator } from '@core/category/application/validations/categories-ids-exists-in-storage';
import { GenresIdExistsInDatabaseValidator } from '@core/genre/application/validations/genres-id-exists-in-database.validator';

export const REPOSITORIES = {
  GENRE_REPOSITORY: {
    provide: 'GenreRepository',
    useExisting: GenreSequelizeRepository,
  },
  GENRE_IN_MEMORY_REPOSITORY: {
    provide: GenreInMemoryRepository,
    useClass: GenreInMemoryRepository,
  },
  GENRE_SEQUELIZE_REPOSITORY: {
    provide: GenreSequelizeRepository,
    inject: [getModelToken(GenreModel), 'UnitOfWork'],
    useFactory(genreModel: typeof GenreModel, uow: UnitOfWorkSequelize) {
      return new GenreSequelizeRepository(genreModel, uow);
    },
  },
};

export const USE_CASES = {
  CREATE_GENRE_USE_CASE: {
    provide: CreateGenreUseCase,
    useFactory(
      uow: IUnitOfWork,
      genreRepo: IGenreRepository,
      categoryRepo: ICategoryRepository,
      categoriesIdValidator: CategoriesIdExistsInStorageValidator,
    ) {
      return new CreateGenreUseCase(
        uow,
        genreRepo,
        categoryRepo,
        categoriesIdValidator,
      );
    },
    inject: [
      'UnitOfWork',
      REPOSITORIES.GENRE_REPOSITORY.provide,
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
      CATEGORY_PROVIDERS.VALIDATIONS.CATEGORIES_IDS_EXISTS_IN_STORAGE_VALIDATOR
        .provide,
    ],
  },
  UPDATE_GENRE_USE_CASE: {
    provide: UpdateGenreUseCase,
    inject: [
      'UnitOfWork',
      REPOSITORIES.GENRE_REPOSITORY.provide,
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
      CATEGORY_PROVIDERS.VALIDATIONS.CATEGORIES_IDS_EXISTS_IN_STORAGE_VALIDATOR
        .provide,
    ],
    useFactory(
      uow: IUnitOfWork,
      genreRepo: IGenreRepository,
      categoryRepo: ICategoryRepository,
      categoriesIdExistsInStorageValidator: CategoriesIdExistsInStorageValidator,
    ) {
      return new UpdateGenreUseCase(
        uow,
        genreRepo,
        categoryRepo,
        categoriesIdExistsInStorageValidator,
      );
    },
  },
  LIST_GENRES_USE_CASE: {
    provide: ListGenresUseCase,
    inject: [
      REPOSITORIES.GENRE_REPOSITORY.provide,
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
    ],
    useFactory(genreRepo: IGenreRepository, categoryRepo: ICategoryRepository) {
      return new ListGenresUseCase(genreRepo, categoryRepo);
    },
  },
  GET_GENRE_USE_CASE: {
    provide: GetGenreUseCase,
    inject: [
      REPOSITORIES.GENRE_REPOSITORY.provide,
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
    ],
    useFactory(genreRepo: IGenreRepository, categoryRepo: ICategoryRepository) {
      return new GetGenreUseCase(genreRepo, categoryRepo);
    },
  },
  DELETE_GENRE_USE_CASE: {
    provide: DeleteGenreUseCase,
    inject: ['UnitOfWork', REPOSITORIES.GENRE_REPOSITORY.provide],
    useFactory(uow: IUnitOfWork, genreRepo: IGenreRepository) {
      return new DeleteGenreUseCase(uow, genreRepo);
    },
  },
};

export const VALIDATIONS = {
  GENRES_IDS_EXISTS_IN_DATABASE_VALIDATOR: {
    provide: GenresIdExistsInDatabaseValidator,
    useFactory: (genreRepo: IGenreRepository) => {
      return new GenresIdExistsInDatabaseValidator(genreRepo);
    },
    inject: [REPOSITORIES.GENRE_REPOSITORY.provide],
  },
};

export const GENRES_PROVIDERS = {
  REPOSITORIES,
  USE_CASES,
  VALIDATIONS,
};
