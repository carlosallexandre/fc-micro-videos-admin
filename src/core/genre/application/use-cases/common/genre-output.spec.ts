import { Category } from '@core/category/domain/category.aggregate';
import { Genre } from '@core/genre/domain/genre.aggregate';
import { GenreOutputMapper } from './genre-output.mapper';

describe('GenreOutputMapper Unit Tests', () => {
  it('should convert a genre in output', () => {
    const categories = Category.fake().theCategories(2).build();
    const created_at = new Date();
    const genre = Genre.fake()
      .aGenre()
      .withName('test')
      .addCategoryId(categories[0].id)
      .addCategoryId(categories[1].id)
      .withCreatedAt(created_at)
      .build();

    const output = GenreOutputMapper.toOutput(genre, categories);

    expect(output).toStrictEqual({
      id: genre.id.value,
      name: 'test',
      categories: [
        {
          id: categories[0].id.value,
          name: categories[0].name,
          created_at: categories[0].created_at,
        },
        {
          id: categories[1].id.value,
          name: categories[1].name,
          created_at: categories[1].created_at,
        },
      ],
      categories_id: [categories[0].id.value, categories[1].id.value],
      is_active: genre.is_active,
      created_at,
    });
  });
});
