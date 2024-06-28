import { DataType, Sequelize } from 'sequelize-typescript';
import type { MigrationFn } from 'umzug';

export const up: MigrationFn<Sequelize> = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().createTable('genre_category', {
    genre_id: {
      type: DataType.UUID,
      allowNull: false,
      primaryKey: true,
    },
    category_id: {
      type: DataType.UUID,
      allowNull: false,
      primaryKey: true,
    },
  });

  await sequelize.getQueryInterface().addConstraint('genre_category', {
    fields: ['genre_id'],
    type: 'foreign key',
    name: 'genre_category_genre_id',
    references: {
      table: 'genres',
      field: 'id',
    },
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  });

  await sequelize.getQueryInterface().addConstraint('genre_category', {
    fields: ['category_id'],
    type: 'foreign key',
    name: 'genre_category_category_id',
    references: {
      table: 'categories',
      field: 'id',
    },
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  });
};

export const down: MigrationFn<Sequelize> = async ({ context: sequelize }) => {
  await sequelize
    .getQueryInterface()
    .removeConstraint('genre_category', 'genre_category_category_id');

  await sequelize
    .getQueryInterface()
    .removeConstraint('genre_category', 'genre_category_genre_id');

  await sequelize.getQueryInterface().dropTable('genre_category');
};
