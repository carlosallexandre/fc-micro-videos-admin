import { UnitOfWorkSequelize } from '@core/@shared/infra/db/sequelize/unit-of-work-sequelize';
import { DeleteGenreUseCase } from './delete-genre.use-case';
import { GenreSequelizeRepository } from '@core/genre/infra/db/sequelize/genre-sequelize.repository';
import { setupSequelize } from '@core/@shared/infra/testing/helpers';
import { GenreModel } from '@core/genre/infra/db/sequelize/genre.model';
import { CategoryModel } from '@core/category/infra/db/sequelize/category.model';
import { GenreCategoryModel } from '@core/genre/infra/db/sequelize/genre-category.model';
import { GenreId } from '@core/genre/domain/genre-id.vo';
import { NotFoundError } from '@core/@shared/domain/errors/not-found.error';
import { Genre } from '@core/genre/domain/genre.aggregate';
import { Category } from '@core/category/domain/category.aggregate';
import { CategorySequelizeRepository } from '@core/category/infra/db/sequelize/category.repository';

describe('DeleteGenreUseCase Integration Tests', () => {
  let useCase: DeleteGenreUseCase;
  let uow: UnitOfWorkSequelize;
  let genreRepo: GenreSequelizeRepository;
  let categoryRepo: CategorySequelizeRepository;

  const sequelizeHelper = setupSequelize({
    models: [GenreModel, CategoryModel, GenreCategoryModel],
  });

  beforeEach(() => {
    uow = new UnitOfWorkSequelize(sequelizeHelper.sequelize);
    genreRepo = new GenreSequelizeRepository(GenreModel, uow);
    categoryRepo = new CategorySequelizeRepository(CategoryModel);
    useCase = new DeleteGenreUseCase(uow, genreRepo);
  });

  it('should throws error when entity not found', async () => {
    const genreId = new GenreId();
    await expect(useCase.execute({ id: genreId.value })).rejects.toThrow(
      new NotFoundError(genreId, Genre),
    );
  });

  it('should delete a genre', async () => {
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
    ).resolves.toBeUndefined();
    await expect(genreRepo.findById(genre.id)).resolves.toBeNull();
  });

  test('rollback transaction', async () => {
    GenreModel.addHook('afterBulkDestroy', 'test', () =>
      Promise.reject(new Error()),
    );
    const categories = Category.fake().theCategories(2).build();
    await categoryRepo.bulkInsert(categories);
    const genre = Genre.fake()
      .aGenre()
      .addCategoryId(categories[0].id)
      .addCategoryId(categories[1].id)
      .build();
    await genreRepo.insert(genre);

    await expect(useCase.execute({ id: genre.id.value })).rejects.toThrow();

    const genres = await genreRepo.findAll();
    expect(genres.length).toBe(1);

    GenreModel.removeHook('afterBulkDestroy', 'test');
  });
});
