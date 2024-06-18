import { setupSequelize } from '@core/@shared/infra/testing/helpers';
import { CategoryModel } from '@core/category/infra/db/sequelize/category.model';
import { DataType } from 'sequelize-typescript';
import { GenreCategoryModel } from './genre-category.model';
import { GenreModel } from './genre.model';

describe('GenreCategoryModel Integration Tests', () => {
  setupSequelize({
    models: [CategoryModel, GenreModel, GenreCategoryModel],
  });

  test('table name', () => {
    expect(GenreCategoryModel.tableName).toBe('genre_category');
  });

  test('mapping props', () => {
    const attributesMap = GenreCategoryModel.getAttributes();
    const attributes = Object.keys(GenreCategoryModel.getAttributes());
    expect(attributes).toStrictEqual(['genre_id', 'category_id']);

    const genreIdAttr = attributesMap.genre_id;
    expect(genreIdAttr).toMatchObject({
      field: 'genre_id',
      fieldName: 'genre_id',
      primaryKey: true,
      type: DataType.UUID(),
      references: {
        model: 'genres',
        key: 'id',
      },
      unique: 'genre_category_genre_id_category_id_unique',
    });

    const categoryIdAttr = attributesMap.category_id;
    expect(categoryIdAttr).toMatchObject({
      field: 'category_id',
      fieldName: 'category_id',
      primaryKey: true,
      type: DataType.UUID(),
      references: {
        model: 'categories',
        key: 'id',
      },
      unique: 'genre_category_genre_id_category_id_unique',
    });
  });
});
