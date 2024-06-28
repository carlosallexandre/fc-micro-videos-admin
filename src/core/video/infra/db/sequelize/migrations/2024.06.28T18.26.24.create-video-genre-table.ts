import { DataType, Sequelize } from 'sequelize-typescript';
import type { MigrationFn } from 'umzug';

export const up: MigrationFn<Sequelize> = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().createTable('genre_video', {
    video_id: {
      type: DataType.UUID,
      allowNull: false,
      primaryKey: true,
    },
    genre_id: {
      type: DataType.UUID,
      allowNull: false,
      primaryKey: true,
    },
  });

  await sequelize.getQueryInterface().addConstraint('genre_video', {
    fields: ['video_id'],
    type: 'foreign key',
    name: 'fk_genre_video_video_id',
    references: {
      table: 'videos',
      field: 'video_id',
    },
    onUpdate: 'RESTRICT',
    onDelete: 'RESTRICT',
  });

  await sequelize.getQueryInterface().addConstraint('genre_video', {
    fields: ['genre_id'],
    type: 'foreign key',
    name: 'fk_genre_video_genre_id',
    references: {
      table: 'genres',
      field: 'id',
    },
    onUpdate: 'RESTRICT',
    onDelete: 'RESTRICT',
  });
};
export const down: MigrationFn<Sequelize> = async ({ context: sequelize }) => {
  await sequelize
    .getQueryInterface()
    .removeConstraint('genre_video', 'fk_genre_video_genre_id');

  await sequelize
    .getQueryInterface()
    .removeConstraint('genre_video', 'fk_genre_video_video_id');

  await sequelize.getQueryInterface().dropTable('genre_video');
};
