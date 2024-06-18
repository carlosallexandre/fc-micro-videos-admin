import { LoadEntityError } from '@core/@shared/domain/errors/validation.error';
import { setupSequelize } from '@core/@shared/infra/testing/helpers';
import { Category } from '@core/category/domain/category.aggregate';
import { ICategoryRepository } from '@core/category/domain/category.repository';
import { CategoryModel } from '@core/category/infra/db/sequelize/category.model';
import { CategorySequelizeRepository } from '@core/category/infra/db/sequelize/category.repository';
import { GenreId } from '@core/genre/domain/genre-id.vo';
import { Genre } from '@core/genre/domain/genre.aggregate';
import { GenreCategoryModel } from './genre-category.model';
import { GenreModelMapper } from './genre-model.mapper';
import { GenreModel } from './genre.model';

describe('GenreModelMapper Unit Tests', () => {
  let categoryRepo: ICategoryRepository;
  setupSequelize({ models: [CategoryModel, GenreModel, GenreCategoryModel] });

  beforeEach(() => {
    categoryRepo = new CategorySequelizeRepository(CategoryModel);
  });

  it.each([
    {
      makeModel: () => {
        return GenreModel.build({
          id: '9366b7dc-2d71-4799-b91c-c64adb205104',
          name: 't'.repeat(256),
          categories_id: [],
        });
      },
      expectedErrors: [
        { categories_id: ['categories_id should not be empty'] },
        { name: ['name must be shorter than or equal to 255 characters'] },
      ],
    },
  ])('should throws error when genre is invalid', (item) => {
    try {
      GenreModelMapper.toDomain(item.makeModel());
      fail('The genre is valid, but it needs throws a LoadEntityError');
    } catch (e) {
      expect(e).toBeInstanceOf(LoadEntityError);
      expect(e.error).toMatchObject(item.expectedErrors);
    }
  });

  it('should convert a genre model to a genre entity', async () => {
    const categories = Category.fake().theCategories(2).build();
    await categoryRepo.bulkInsert(categories);
    const created_at = new Date();
    const genreId = '5490020a-e866-4229-9adc-aa44b83234c4';
    const model = await GenreModel.create(
      {
        id: genreId,
        name: 'some value',
        categories_id: categories.map((category) =>
          GenreCategoryModel.build({
            genre_id: genreId,
            category_id: category.id.toString(),
          }),
        ),
        is_active: true,
        created_at,
      },
      { include: ['categories_id'] },
    );

    const entity = GenreModelMapper.toDomain(model);

    expect(entity.toJSON()).toEqual(
      new Genre({
        id: new GenreId(genreId),
        name: 'some value',
        categories_id: new Map(categories.map((c) => [c.id.toString(), c.id])),
        is_active: true,
        created_at,
      }).toJSON(),
    );
  });
});
