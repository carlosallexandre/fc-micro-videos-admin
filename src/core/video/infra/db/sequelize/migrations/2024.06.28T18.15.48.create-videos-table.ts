import { RatingValues } from '@core/video/domain/rating.vo';
import { DataType, Sequelize } from 'sequelize-typescript';
import type { MigrationFn } from 'umzug';

export const up: MigrationFn<Sequelize> = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().createTable('videos', {
    video_id: {
      type: DataType.UUID,
      allowNull: false,
      primaryKey: true,
    },
    title: {
      type: DataType.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataType.TEXT,
      allowNull: false,
    },
    year_launched: {
      type: DataType.SMALLINT,
      allowNull: false,
    },
    duration: {
      type: DataType.SMALLINT,
      allowNull: false,
    },
    rating: {
      type: DataType.ENUM(...Object.values(RatingValues)),
      allowNull: false,
    },
    is_opened: {
      type: DataType.BOOLEAN,
      allowNull: false,
    },
    is_published: {
      type: DataType.BOOLEAN,
      allowNull: false,
    },
    created_at: {
      type: DataType.DATE(6),
      allowNull: false,
    },
  });
};
export const down: MigrationFn<Sequelize> = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().dropTable('videos');
};
