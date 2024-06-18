import { Genre } from '@core/genre/domain/genre.aggregate';
import { GenreInMemoryRepository } from './genre-in-memory.repository';
import { GenreSearchParams } from '@core/genre/domain/genre-search-params.vo';
import { CategoryId } from '@core/category/domain/category-id.vo';

describe('GenreInMemoryRepository Unit Tests', () => {
  let repository: GenreInMemoryRepository;

  beforeEach(() => (repository = new GenreInMemoryRepository()));

  it('should no filter items when filter object is null', () => {
    const items = [
      Genre.fake().aGenre().build(),
      Genre.fake().aGenre().build(),
    ];

    const itemsFiltered = repository['applyFilter'](
      items,
      GenreSearchParams.create(),
    );

    expect(itemsFiltered).toStrictEqual(items);
  });

  it('should filter items by name', () => {
    const faker = Genre.fake().aGenre();
    const items = [
      faker.withName('test').build(),
      faker.withName('TEST').build(),
      faker.withName('fake').build(),
    ];

    const itemsFiltered = repository['applyFilter'](
      items,
      GenreSearchParams.create({ filter: { name: 'TEST' } }),
    );
    expect(itemsFiltered).toStrictEqual([items[0], items[1]]);
  });

  it('should filter items by categories_id', () => {
    const categoryId1 = new CategoryId();
    const categoryId2 = new CategoryId();
    const categoryId3 = new CategoryId();
    const categoryId4 = new CategoryId();
    const items = [
      Genre.fake()
        .aGenre()
        .addCategoryId(categoryId1)
        .addCategoryId(categoryId2)
        .build(),
      Genre.fake()
        .aGenre()
        .addCategoryId(categoryId3)
        .addCategoryId(categoryId4)
        .build(),
    ];

    let itemsFiltered = repository['applyFilter'](
      items,
      GenreSearchParams.create({ filter: { categories_id: [categoryId1] } }),
    );
    expect(itemsFiltered).toStrictEqual([items[0]]);

    itemsFiltered = repository['applyFilter'](
      items,
      GenreSearchParams.create({ filter: { categories_id: [categoryId2] } }),
    );
    expect(itemsFiltered).toStrictEqual([items[0]]);

    itemsFiltered = repository['applyFilter'](
      items,
      GenreSearchParams.create({
        filter: { categories_id: [categoryId1, categoryId2] },
      }),
    );
    expect(itemsFiltered).toStrictEqual([items[0]]);

    itemsFiltered = repository['applyFilter'](
      items,
      GenreSearchParams.create({
        filter: {
          categories_id: [categoryId1, categoryId3],
        },
      }),
    );
    expect(itemsFiltered).toStrictEqual([...items]);

    itemsFiltered = repository['applyFilter'](
      items,
      GenreSearchParams.create({
        filter: {
          categories_id: [categoryId3, categoryId1],
        },
      }),
    );
    expect(itemsFiltered).toStrictEqual([...items]);
  });

  it('should filter items by name and categories_id', () => {
    const categoryId1 = new CategoryId();
    const categoryId2 = new CategoryId();
    const categoryId3 = new CategoryId();
    const categoryId4 = new CategoryId();
    const items = [
      Genre.fake()
        .aGenre()
        .withName('test')
        .addCategoryId(categoryId1)
        .addCategoryId(categoryId2)
        .build(),
      Genre.fake()
        .aGenre()
        .withName('fake')
        .addCategoryId(categoryId3)
        .addCategoryId(categoryId4)
        .build(),
      Genre.fake()
        .aGenre()
        .withName('test fake')
        .addCategoryId(categoryId1)
        .build(),
    ];

    let itemsFiltered = repository['applyFilter'](
      items,
      GenreSearchParams.create({
        filter: {
          name: 'test',
          categories_id: [categoryId1],
        },
      }),
    );
    expect(itemsFiltered).toStrictEqual([items[0], items[2]]);

    itemsFiltered = repository['applyFilter'](
      items,
      GenreSearchParams.create({
        filter: {
          name: 'test',
          categories_id: [categoryId3],
        },
      }),
    );
    expect(itemsFiltered).toStrictEqual([]);

    itemsFiltered = repository['applyFilter'](
      items,
      GenreSearchParams.create({
        filter: {
          name: 'fake',
          categories_id: [categoryId4],
        },
      }),
    );
    expect(itemsFiltered).toStrictEqual([items[1]]);
  });

  it('should sort by created_at when sort param is null', () => {
    const items = [
      Genre.fake().aGenre().withCreatedAt(new Date()).build(),
      Genre.fake()
        .aGenre()
        .withCreatedAt(new Date(new Date().getTime() + 1))
        .build(),
      Genre.fake()
        .aGenre()
        .withCreatedAt(new Date(new Date().getTime() + 2))
        .build(),
    ];

    const itemsSorted = repository['applySort'](
      items,
      GenreSearchParams.create(),
    );
    expect(itemsSorted).toStrictEqual([items[2], items[1], items[0]]);
  });

  it('should sort by name', () => {
    const items = [
      Genre.fake().aGenre().withName('c').build(),
      Genre.fake().aGenre().withName('b').build(),
      Genre.fake().aGenre().withName('a').build(),
    ];

    let itemsSorted = repository['applySort'](
      items,
      GenreSearchParams.create({ sort: 'name', sort_dir: 'asc' }),
    );
    expect(itemsSorted).toStrictEqual([items[2], items[1], items[0]]);

    itemsSorted = repository['applySort'](
      items,
      GenreSearchParams.create({ sort: 'name', sort_dir: 'desc' }),
    );
    expect(itemsSorted).toStrictEqual([items[0], items[1], items[2]]);
  });
});
