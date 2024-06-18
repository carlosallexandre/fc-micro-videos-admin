import { CategoryId } from '@core/category/domain/category-id.vo';
import { GenreSearchParams } from './genre-search-params.vo';

describe('GenreSearchParams Unit Tests', () => {
  it('should create a new instnace with default values', () => {
    const searchParams = GenreSearchParams.create();

    expect(searchParams).toBeInstanceOf(GenreSearchParams);
    expect(searchParams.filter).toBeNull();
  });

  it('should create a new instnace with provided values', () => {
    const searchParams = GenreSearchParams.create({
      filter: {
        name: 'Action',
        categories_id: ['123e4567-e89b-12d3-a456-426655440000'],
      },
    });

    expect(searchParams).toBeInstanceOf(GenreSearchParams);
    expect(searchParams.filter).toStrictEqual({
      name: 'Action',
      categories_id: [new CategoryId('123e4567-e89b-12d3-a456-426655440000')],
    });
  });
});
