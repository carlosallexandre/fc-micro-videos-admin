import { Genre } from '@core/genre/domain/genre.aggregate';
import { UpdateGenreUseCase } from './update-genre.use-case';
import { UnitOfWorkInMemory } from '@core/@shared/infra/db/in-memory/in-memory-unit-of-work';
import { GenreInMemoryRepository } from '@core/genre/infra/db/in-memory/genre-in-memory.repository';
import { CategoryInMemoryRepository } from '@core/category/infra/db/in-memory/category-in-memory.repository';
import { CategoriesIdExistsInStorageValidator } from '@core/category/application/validations/categories-ids-exists-in-storage';
import { EntityValidationError } from '@core/@shared/domain/errors/validation.error';
import { Category } from '@core/category/domain/category.aggregate';

describe('UpdateGenreUseCase Unit Tests', () => {
  let useCase: UpdateGenreUseCase;
  let uow: UnitOfWorkInMemory;
  let genreRepo: GenreInMemoryRepository;
  let categoryRepo: CategoryInMemoryRepository;
  let categoriesIdExistsInStorageValidator: CategoriesIdExistsInStorageValidator;

  // prettier-ignore
  beforeEach(() => {
    uow = new UnitOfWorkInMemory();
    genreRepo = new GenreInMemoryRepository();
    categoryRepo = new CategoryInMemoryRepository();
    categoriesIdExistsInStorageValidator = new CategoriesIdExistsInStorageValidator(categoryRepo)
    useCase = new UpdateGenreUseCase(uow, genreRepo, categoryRepo, categoriesIdExistsInStorageValidator);
  })

  it('should throws entity validation error when categories id not exists', async () => {
    expect.assertions(2);

    const genre = Genre.fake().aGenre().build();
    await genreRepo.insert(genre);

    try {
      await useCase.execute({
        id: genre.id.value,
        name: 'test',
        is_active: false,
        categories_id: [
          '7ea89161-473b-43f3-92ef-0741b8258fe7',
          '747b0e14-dcaf-417a-8224-19eb32f8b411',
        ],
      });
    } catch (e) {
      expect(e).toBeInstanceOf(EntityValidationError);
      expect(e.error).toStrictEqual([
        {
          categories_id: [
            'Category Not Found using ID 7ea89161-473b-43f3-92ef-0741b8258fe7',
            'Category Not Found using ID 747b0e14-dcaf-417a-8224-19eb32f8b411',
          ],
        },
      ]);
    }
  });

  it('should update a genre', async () => {
    const category1 = Category.fake().aCategory().build();
    const category2 = Category.fake().aCategory().build();
    await categoryRepo.bulkInsert([category1, category2]);
    const genre1 = Genre.fake()
      .aGenre()
      .addCategoryId(category1.category_id)
      .addCategoryId(category2.category_id)
      .build();
    await genreRepo.insert(genre1);
    const spyUpdate = jest.spyOn(genreRepo, 'update');
    const spyUowDo = jest.spyOn(uow, 'do');

    let output = await useCase.execute({
      id: genre1.id.value,
      name: 'test',
      categories_id: [category1.id.value],
    });
    expect(spyUowDo).toHaveBeenCalledTimes(1);
    expect(spyUpdate).toHaveBeenCalledTimes(1);
    expect(output).toStrictEqual({
      id: genre1.id.value,
      name: 'test',
      categories: [
        {
          id: category1.id.value,
          name: category1.name,
          created_at: category1.created_at,
        },
      ],
      categories_id: [category1.id.value],
      is_active: true,
      created_at: genreRepo.items[0].created_at,
    });

    output = await useCase.execute({
      id: genre1.id.value,
      name: 'test',
      categories_id: [category1.id.value, category2.id.value],
      is_active: false,
    });
    expect(spyUpdate).toHaveBeenCalledTimes(2);
    expect(spyUowDo).toHaveBeenCalledTimes(2);
    expect(output).toStrictEqual({
      id: genre1.id.value,
      name: 'test',
      categories_id: expect.arrayContaining([
        category1.id.value,
        category2.id.value,
      ]),
      categories: expect.arrayContaining([
        {
          id: category1.id.value,
          name: category1.name,
          created_at: category1.created_at,
        },
        {
          id: category2.id.value,
          name: category2.name,
          created_at: category2.created_at,
        },
      ]),
      is_active: false,
      created_at: genreRepo.items[0].created_at,
    });
  });
});
