import { DataType, Sequelize } from 'sequelize-typescript';
import type { MigrationFn } from 'umzug';

export const up: MigrationFn<Sequelize> = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().createTable('image_medias', {
    image_media_id: {
      type: DataType.UUID,
      allowNull: false,
      primaryKey: true,
    },
    video_id: {
      type: DataType.UUID,
      allowNull: false,
    },
    video_related_field: {
      type: DataType.STRING(20),
      allowNull: false,
    },
    name: {
      type: DataType.STRING(255),
      allowNull: false,
    },
    location: {
      type: DataType.STRING(255),
      allowNull: false,
    },
  });

  await sequelize.getQueryInterface().addConstraint('image_medias', {
    fields: ['video_id'],
    type: 'foreign key',
    name: 'fk_image_medias_video_id',
    references: {
      table: 'videos',
      field: 'video_id',
    },
    onUpdate: 'RESTRICT',
    onDelete: 'RESTRICT',
  });

  await sequelize.getQueryInterface().addConstraint('image_medias', {
    fields: ['video_id', 'video_related_field'],
    type: 'unique',
    name: 'uq_image_medias_video_id_video_related_field',
  });
};

export const down: MigrationFn<Sequelize> = async ({ context: sequelize }) => {
  // await sequelize
  //   .getQueryInterface()
  //   .removeConstraint(
  //     'image_medias',
  //     'uq_image_medias_video_id_video_related_field',
  //   );

  await sequelize
    .getQueryInterface()
    .removeConstraint('image_medias', 'fk_image_medias_video_id');

  await sequelize.getQueryInterface().dropTable('image_medias');
};
