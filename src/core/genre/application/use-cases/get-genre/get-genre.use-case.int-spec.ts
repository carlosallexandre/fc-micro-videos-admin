import { UnitOfWorkSequelize } from '@core/@shared/infra/db/sequelize/unit-of-work-sequelize';
import { GetGenreUseCase } from './get-genre.use-case';
import { GenreSequelizeRepository } from '@core/genre/infra/db/sequelize/genre-sequelize.repository';
import { CategorySequelizeRepository } from '@core/category/infra/db/sequelize/category.repository';
import { setupSequelize } from '@core/@shared/infra/testing/helpers';
import { CategoryModel } from '@core/category/infra/db/sequelize/category.model';
import { GenreModel } from '@core/genre/infra/db/sequelize/genre.model';
import { GenreCategoryModel } from '@core/genre/infra/db/sequelize/genre-category.model';
import { GenreId } from '@core/genre/domain/genre-id.vo';
import { NotFoundError } from '@core/@shared/domain/errors/not-found.error';
import { Genre } from '@core/genre/domain/genre.aggregate';
import { Category } from '@core/category/domain/category.aggregate';

describe('GetGenreUseCase Integration Tests', () => {
  let useCase: GetGenreUseCase;
  let uow: UnitOfWorkSequelize;
  let genreRepo: GenreSequelizeRepository;
  let categoryRepo: CategorySequelizeRepository;

  const sequelizeHelper = setupSequelize({
    models: [CategoryModel, GenreModel, GenreCategoryModel],
  });

  beforeEach(() => {
    uow = new UnitOfWorkSequelize(sequelizeHelper.sequelize);
    genreRepo = new GenreSequelizeRepository(GenreModel, uow);
    categoryRepo = new CategorySequelizeRepository(CategoryModel);
    useCase = new GetGenreUseCase(genreRepo, categoryRepo);
  });

  it('should throws error when entity not found', async () => {
    const genreId = new GenreId();
    await expect(useCase.execute({ id: genreId.value })).rejects.toThrow(
      new NotFoundError(genreId, Genre),
    );
  });

  it('should returns a genre', async () => {
    const categories = Category.fake().theCategories(2).build();
    await categoryRepo.bulkInsert(categories);
    const genre = Genre.fake()
      .aGenre()
      .addCategoryId(categories[0].id)
      .addCategoryId(categories[1].id)
      .build();
    await genreRepo.insert(genre);

    await expect(
      useCase.execute({ id: genre.id.value }),
    ).resolves.toStrictEqual({
      id: genre.id.value,
      name: genre.name,
      is_active: genre.is_active,
      created_at: genre.created_at,
      categories_id: expect.arrayContaining(categories.map((c) => c.id.value)),
      categories: expect.arrayContaining(
        categories.map((c) => ({
          id: c.id.value,
          name: c.name,
          created_at: c.created_at,
        })),
      ),
    });
  });
});
