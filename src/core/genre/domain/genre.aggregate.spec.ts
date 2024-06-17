import { CategoryId } from '@core/category/domain/category-id.vo';
import { Genre } from './genre.aggregate';
import { GenreId } from './genre-id.vo';

describe('Genre Unit Tests', () => {
  test('constructor of genre', () => {
    const categoryId = new CategoryId();
    const categoriesId = new Map([[categoryId.value, categoryId]]);
    let genre = new Genre({
      name: 'test',
      categories_id: categoriesId,
    });
    expect(genre.id).toBeInstanceOf(GenreId);
    expect(genre.name).toBe('test');
    expect(genre.categories_id).toEqual(categoriesId);
    expect(genre.is_active).toBe(true);
    expect(genre.created_at).toBeInstanceOf(Date);

    const created_at = new Date();
    genre = new Genre({
      name: 'test',
      categories_id: categoriesId,
      is_active: false,
      created_at,
    });
    expect(genre.id).toBeInstanceOf(GenreId);
    expect(genre.name).toBe('test');
    expect(genre.categories_id).toEqual(categoriesId);
    expect(genre.is_active).toBe(false);
    expect(genre.created_at).toBe(created_at);
  });

  describe('genre_id field', () => {
    const categoryId = new CategoryId();
    const categories_id = new Map([[categoryId.value, categoryId]]);

    test.each([
      { name: 'Movie', categories_id },
      { name: 'Movie', categories_id, id: null },
      { name: 'Movie', categories_id, id: undefined },
      { name: 'Movie', categories_id, id: new GenreId() },
    ])('when props is %j', (item) => {
      const genre = new Genre(item);
      expect(genre.id).toBeInstanceOf(GenreId);
    });
  });

  describe('create command', () => {
    it('should create a genre', () => {
      const categoryId = new CategoryId();
      const categories_id = new Map([[categoryId.value, categoryId]]);
      const genre = Genre.create({
        name: 'test',
        categories_id: [categoryId],
      });
      expect(genre.id).toBeInstanceOf(GenreId);
      expect(genre.name).toBe('test');
      expect(genre.categories_id).toEqual(categories_id);
      expect(genre.created_at).toBeInstanceOf(Date);

      const genre2 = Genre.create({
        name: 'test',
        categories_id: [categoryId],
        is_active: false,
      });
      expect(genre2.id).toBeInstanceOf(GenreId);
      expect(genre2.name).toBe('test');
      expect(genre2.categories_id).toEqual(categories_id);
      expect(genre2.is_active).toBe(false);
      expect(genre2.created_at).toBeInstanceOf(Date);
    });
  });

  test('should change name', () => {
    const genre = Genre.create({
      name: 'test',
      categories_id: [new CategoryId()],
    });
    genre.changeName('test2');
    expect(genre.name).toBe('test2');
  });

  test('should add category id', () => {
    const categoryId = new CategoryId();
    const genre = Genre.create({
      name: 'test',
      categories_id: [categoryId],
    });
    genre.addCategoryId(categoryId);
    expect(genre.categories_id.size).toBe(1);
    expect(genre.categories_id).toEqual(
      new Map([[categoryId.value, categoryId]]),
    );

    const categoryId2 = new CategoryId();
    genre.addCategoryId(categoryId2);
    expect(genre.categories_id.size).toBe(2);
    expect(genre.categories_id).toEqual(
      new Map([
        [categoryId.value, categoryId],
        [categoryId2.value, categoryId2],
      ]),
    );
  });
});
