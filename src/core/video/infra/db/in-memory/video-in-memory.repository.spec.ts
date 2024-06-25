import { VideoSearchParams } from '@core/video/domain/video.repository';
import { Video } from '../../../domain/video.aggregate';
import { VideoInMemoryRepository } from './video-in-memory.repository';
import { CategoryId } from '@core/category/domain/category-id.vo';
import { GenreId } from '@core/genre/domain/genre-id.vo';

describe('VideoInMemoryRepository', () => {
  let repository: VideoInMemoryRepository;

  beforeEach(() => (repository = new VideoInMemoryRepository()));
  it('should no filter items when filter object is null', () => {
    const items = [
      Video.fake().aVideoWithoutMedias().build(),
      Video.fake().aVideoWithoutMedias().build(),
    ];
    const filterSpy = jest.spyOn(items, 'filter' as any);

    const itemsFiltered = repository['applyFilter'](items, null);
    expect(filterSpy).not.toHaveBeenCalled();
    expect(itemsFiltered).toStrictEqual(items);
  });

  it('should filter items by title', () => {
    const faker = Video.fake().aVideoWithAllMedias();
    const items = [
      faker.withTitle('test').build(),
      faker.withTitle('TEST').build(),
      faker.withTitle('fake').build(),
    ];
    const filterSpy = jest.spyOn(items, 'filter' as any);

    const itemsFiltered = repository['applyFilter'](
      items,
      VideoSearchParams.create({
        filter: {
          title: 'TEST',
        },
      }),
    );
    expect(filterSpy).toHaveBeenCalledTimes(1);
    expect(itemsFiltered).toStrictEqual([items[0], items[1]]);
  });

  it('should filter items by categories_id', () => {
    const categoryId1 = new CategoryId();
    const categoryId2 = new CategoryId();
    const categoryId3 = new CategoryId();
    const categoryId4 = new CategoryId();
    const items = [
      Video.fake()
        .aVideoWithoutMedias()
        .addCategoryId(categoryId1)
        .addCategoryId(categoryId2)
        .build(),
      Video.fake()
        .aVideoWithoutMedias()
        .addCategoryId(categoryId3)
        .addCategoryId(categoryId4)
        .build(),
    ];
    const filterSpy = jest.spyOn(items, 'filter' as any);

    let itemsFiltered = repository['applyFilter'](
      items,
      VideoSearchParams.create({
        filter: {
          categories_id: [categoryId1],
        },
      }),
    );
    expect(filterSpy).toHaveBeenCalledTimes(1);
    expect(itemsFiltered).toStrictEqual([items[0]]);

    itemsFiltered = repository['applyFilter'](
      items,
      VideoSearchParams.create({
        filter: {
          categories_id: [categoryId2],
        },
      }),
    );
    expect(filterSpy).toHaveBeenCalledTimes(2);
    expect(itemsFiltered).toStrictEqual([items[0]]);

    itemsFiltered = repository['applyFilter'](
      items,
      VideoSearchParams.create({
        filter: {
          categories_id: [categoryId1, categoryId2],
        },
      }),
    );
    expect(filterSpy).toHaveBeenCalledTimes(3);
    expect(itemsFiltered).toStrictEqual([items[0]]);

    itemsFiltered = repository['applyFilter'](
      items,
      VideoSearchParams.create({
        filter: {
          categories_id: [categoryId1, categoryId3],
        },
      }),
    );
    expect(filterSpy).toHaveBeenCalledTimes(4);
    expect(itemsFiltered).toStrictEqual([...items]);

    itemsFiltered = repository['applyFilter'](
      items,
      VideoSearchParams.create({
        filter: {
          categories_id: [categoryId3, categoryId1],
        },
      }),
    );
    expect(filterSpy).toHaveBeenCalledTimes(5);
    expect(itemsFiltered).toStrictEqual([...items]);
  });

  it('should filter items by title and categories_id', () => {
    const categoryId1 = new CategoryId();
    const categoryId2 = new CategoryId();
    const categoryId3 = new CategoryId();
    const categoryId4 = new CategoryId();
    const items = [
      Video.fake()
        .aVideoWithoutMedias()
        .withTitle('test')
        .addCategoryId(categoryId1)
        .addCategoryId(categoryId2)
        .build(),
      Video.fake()
        .aVideoWithoutMedias()
        .withTitle('fake')
        .addCategoryId(categoryId3)
        .addCategoryId(categoryId4)
        .build(),
      Video.fake()
        .aVideoWithoutMedias()
        .withTitle('test fake')
        .addCategoryId(categoryId1)
        .build(),
    ];

    let itemsFiltered = repository['applyFilter'](
      items,
      VideoSearchParams.create({
        filter: {
          title: 'test',
          categories_id: [categoryId1],
        },
      }),
    );
    expect(itemsFiltered).toStrictEqual([items[0], items[2]]);

    itemsFiltered = repository['applyFilter'](
      items,
      VideoSearchParams.create({
        filter: {
          title: 'test',
          categories_id: [categoryId3],
        },
      }),
    );
    expect(itemsFiltered).toStrictEqual([]);

    itemsFiltered = repository['applyFilter'](
      items,
      VideoSearchParams.create({
        filter: {
          title: 'fake',
          categories_id: [categoryId4],
        },
      }),
    );
    expect(itemsFiltered).toStrictEqual([items[1]]);
  });

  it('should filter items by title and categories_id and genres_id', () => {
    const categoryId1 = new CategoryId();
    const categoryId2 = new CategoryId();
    const categoryId3 = new CategoryId();
    const categoryId4 = new CategoryId();

    const genreId1 = new GenreId();
    const items = [
      Video.fake()
        .aVideoWithoutMedias()
        .withTitle('test')
        .addCategoryId(categoryId1)
        .addCategoryId(categoryId2)
        .build(),
      Video.fake()
        .aVideoWithoutMedias()
        .withTitle('fake')
        .addCategoryId(categoryId3)
        .addCategoryId(categoryId4)
        .build(),
      Video.fake()
        .aVideoWithoutMedias()
        .withTitle('test fake')
        .addCategoryId(categoryId1)
        .addGenreId(genreId1)
        .build(),
    ];

    const itemsFiltered = repository['applyFilter'](
      items,
      VideoSearchParams.create({
        filter: {
          title: 'test',
          categories_id: [categoryId1],
          genres_id: [genreId1],
        },
      }),
    );
    expect(itemsFiltered).toStrictEqual([items[2]]);
  });

  it('should sort by created_at when sort param is null', () => {
    const items = [
      Video.fake().aVideoWithoutMedias().withCreatedAt(new Date()).build(),
      Video.fake()
        .aVideoWithoutMedias()
        .withCreatedAt(new Date(new Date().getTime() + 1))
        .build(),
      Video.fake()
        .aVideoWithoutMedias()
        .withCreatedAt(new Date(new Date().getTime() + 2))
        .build(),
    ];

    const itemsSorted = repository['applySort'](
      items,
      VideoSearchParams.create(),
    );
    expect(itemsSorted).toStrictEqual([items[2], items[1], items[0]]);
  });

  it('should sort by title', () => {
    const items = [
      Video.fake().aVideoWithoutMedias().withTitle('c').build(),
      Video.fake().aVideoWithoutMedias().withTitle('b').build(),
      Video.fake().aVideoWithoutMedias().withTitle('a').build(),
    ];

    let itemsSorted = repository['applySort'](
      items,
      VideoSearchParams.create({ sort: 'title', sort_dir: 'asc' }),
    );
    expect(itemsSorted).toStrictEqual([items[2], items[1], items[0]]);

    itemsSorted = repository['applySort'](
      items,
      VideoSearchParams.create({ sort: 'title', sort_dir: 'desc' }),
    );
    expect(itemsSorted).toStrictEqual([items[0], items[1], items[2]]);
  });
});
