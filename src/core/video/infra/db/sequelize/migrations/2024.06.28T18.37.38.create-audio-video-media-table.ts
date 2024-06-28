import { AudioVideoMediaStatus } from '@core/video/domain/audio-video-media.vo';
import { DataType, Sequelize } from 'sequelize-typescript';
import type { MigrationFn } from 'umzug';

export const up: MigrationFn<Sequelize> = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().createTable('audio_video_medias', {
    audio_video_media_id: {
      type: DataType.UUID,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataType.STRING(255),
      allowNull: false,
    },
    raw_location: {
      type: DataType.STRING(255),
      allowNull: false,
    },
    encoded_location: {
      type: DataType.STRING(255),
      allowNull: true,
    },
    status: {
      type: DataType.ENUM(...Object.values(AudioVideoMediaStatus)),
      allowNull: false,
    },
    video_id: {
      type: DataType.UUID,
      allowNull: false,
    },
    video_related_field: {
      type: DataType.STRING(20),
      allowNull: false,
    },
  });

  await sequelize.getQueryInterface().addConstraint('audio_video_medias', {
    fields: ['video_id'],
    type: 'foreign key',
    name: 'fk_audio_video_medias_video_id',
    references: {
      table: 'videos',
      field: 'video_id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  });

  await sequelize.getQueryInterface().addConstraint('audio_video_medias', {
    fields: ['video_id', 'video_related_field'],
    type: 'unique',
    name: 'uq_audio_video_medias_video_id_video_related_field',
  });
};

export const down: MigrationFn<Sequelize> = async ({ context: sequelize }) => {
  // await sequelize
  //   .getQueryInterface()
  //   .removeConstraint(
  //     'audio_video_medias',
  //     'uq_audio_video_medias_video_id_video_related_field',
  //   );

  await sequelize
    .getQueryInterface()
    .removeConstraint('audio_video_medias', 'fk_audio_video_medias_video_id');

  await sequelize.getQueryInterface().dropTable('audio_video_medias');
};
