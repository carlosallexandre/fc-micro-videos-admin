import { setupSequelize } from '@core/@shared/infra/testing/helpers';
import { Category } from '@core/category/domain/category.aggregate';
import { CategoryModel } from '@core/category/infra/db/sequelize/category.model';
import { CategorySequelizeRepository } from '@core/category/infra/db/sequelize/category.repository';
import { DataType } from 'sequelize-typescript';
import { GenreCategoryModel } from './genre-category.model';
import { GenreModel } from './genre.model';

describe('GenreModel Integration Tests', () => {
  setupSequelize({
    models: [CategoryModel, GenreModel, GenreCategoryModel],
  });

  test('table name', () => {
    expect(GenreModel.tableName).toBe('genres');
  });

  test('mapping props', () => {
    const attributesMap = GenreModel.getAttributes();
    const attributes = Object.keys(GenreModel.getAttributes());
    expect(attributes).toStrictEqual(['id', 'name', 'is_active', 'created_at']);

    const genreIdAttr = attributesMap.id;
    expect(genreIdAttr).toMatchObject({
      field: 'id',
      fieldName: 'id',
      primaryKey: true,
      type: DataType.UUID(),
    });

    const nameAttr = attributesMap.name;
    expect(nameAttr).toMatchObject({
      field: 'name',
      fieldName: 'name',
      allowNull: false,
      type: DataType.STRING(255),
    });

    const isActiveAttr = attributesMap.is_active;
    expect(isActiveAttr).toMatchObject({
      field: 'is_active',
      fieldName: 'is_active',
      allowNull: false,
      type: DataType.BOOLEAN(),
    });

    const createdAtAttr = attributesMap.created_at;
    expect(createdAtAttr).toMatchObject({
      field: 'created_at',
      fieldName: 'created_at',
      allowNull: false,
      type: DataType.DATE(6),
    });
  });

  test('mapping associations', () => {
    const associationsMap = GenreModel.associations;
    const associations = Object.keys(associationsMap);
    expect(associations).toStrictEqual(['categories_id', 'categories']);

    const categoriesIdRelation = associationsMap.categories_id;
    expect(categoriesIdRelation).toMatchObject({
      associationType: 'HasMany',
      source: GenreModel,
      target: GenreCategoryModel,
      options: {
        foreignKey: { name: 'genre_id' },
        as: 'categories_id',
      },
    });

    const categoriesRelation = associationsMap.categories;
    expect(categoriesRelation).toMatchObject({
      associationType: 'BelongsToMany',
      source: GenreModel,
      target: CategoryModel,
      options: {
        through: { model: GenreCategoryModel },
        foreignKey: { name: 'genre_id' },
        otherKey: { name: 'category_id' },
        as: 'categories',
      },
    });
  });

  test('create and association relations separately', async () => {
    const categories = Category.fake().theCategories(3).build();
    const categoryRepo = new CategorySequelizeRepository(CategoryModel);
    await categoryRepo.bulkInsert(categories);

    const genreData = {
      id: '9366b7dc-2d71-4799-b91c-c64adb205104',
      name: 'test',
      is_active: true,
      created_at: new Date(),
    };

    const genreModel = await GenreModel.create(genreData);
    await genreModel.$add('categories', [
      categories[0].category_id.value,
      categories[1].category_id.value,
      categories[2].category_id.value,
    ]);

    const genreWithCategories = await GenreModel.findByPk(genreModel.id, {
      include: [{ model: CategoryModel, attributes: ['id'] }],
    });
    expect(genreWithCategories).toMatchObject(genreData);
    expect(genreWithCategories!.categories).toHaveLength(3);
    expect(genreWithCategories!.categories).toEqual(
      expect.arrayContaining(
        categories.map((category) =>
          expect.objectContaining({ id: category.id.value }),
        ),
      ),
    );

    const genreWithCategoriesId = await GenreModel.findByPk(genreModel.id, {
      include: ['categories_id'],
    });
    expect(genreWithCategoriesId!.categories_id).toHaveLength(3);
    expect(genreWithCategoriesId!.categories_id).toEqual(
      expect.arrayContaining(
        categories.map((category) =>
          expect.objectContaining({
            genre_id: genreData.id,
            category_id: category.id.value,
          }),
        ),
      ),
    );
  });

  test('create with association in single transaction ', async () => {
    const categories = Category.fake().theCategories(3).build();
    const categoryRepo = new CategorySequelizeRepository(CategoryModel);
    await categoryRepo.bulkInsert(categories);

    const genre_id = '9366b7dc-2d71-4799-b91c-c64adb205104';
    const genreModelData = {
      id: genre_id,
      name: 'test',
      is_active: true,
      categories_id: categories.map((category) =>
        GenreCategoryModel.build({
          category_id: category.id.value,
          genre_id,
        }),
      ),
      created_at: new Date(),
    };
    const genreModel = await GenreModel.create(genreModelData, {
      include: ['categories_id'],
    });

    const genreWithCategories = await GenreModel.findByPk(genreModel.id, {
      include: [
        {
          model: CategoryModel,
          attributes: ['id'],
        },
      ],
    });
    const { categories_id, ...genreCommonProps } = genreModelData;
    expect(genreWithCategories).toMatchObject(genreCommonProps);
    expect(genreWithCategories!.categories).toHaveLength(3);
    expect(genreWithCategories!.categories).toEqual(
      expect.arrayContaining(
        categories.map((category) =>
          expect.objectContaining({
            id: category.id.value,
          }),
        ),
      ),
    );

    const genreWithCategoriesId = await GenreModel.findByPk(genreModel.id, {
      include: ['categories_id'],
    });
    expect(genreWithCategoriesId!.categories_id).toHaveLength(3);
    expect(genreWithCategoriesId!.categories_id).toEqual(
      expect.arrayContaining(
        categories.map((category) =>
          expect.objectContaining({
            genre_id,
            category_id: category.id.value,
          }),
        ),
      ),
    );
  });
});
