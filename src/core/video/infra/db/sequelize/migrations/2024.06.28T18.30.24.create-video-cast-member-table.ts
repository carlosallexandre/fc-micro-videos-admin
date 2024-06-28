import { DataType, Sequelize } from 'sequelize-typescript';
import type { MigrationFn } from 'umzug';

export const up: MigrationFn<Sequelize> = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().createTable('cast_member_video', {
    video_id: {
      type: DataType.UUID,
      allowNull: false,
      primaryKey: true,
    },
    cast_member_id: {
      type: DataType.UUID,
      allowNull: false,
      primaryKey: true,
    },
  });

  await sequelize.getQueryInterface().addConstraint('cast_member_video', {
    fields: ['video_id'],
    type: 'foreign key',
    name: 'fk_cast_member_video_video_id',
    references: {
      table: 'videos',
      field: 'video_id',
    },
    onUpdate: 'RESTRICT',
    onDelete: 'RESTRICT',
  });

  await sequelize.getQueryInterface().addConstraint('cast_member_video', {
    fields: ['cast_member_id'],
    type: 'foreign key',
    name: 'fk_cast_member_video_cast_member_id',
    references: {
      table: 'cast_members',
      field: 'id',
    },
    onUpdate: 'RESTRICT',
    onDelete: 'RESTRICT',
  });
};

export const down: MigrationFn<Sequelize> = async ({ context: sequelize }) => {
  await sequelize
    .getQueryInterface()
    .removeConstraint(
      'cast_member_video',
      'fk_cast_member_video_cast_member_id',
    );

  await sequelize
    .getQueryInterface()
    .removeConstraint('cast_member_video', 'fk_cast_member_video_video_id');

  await sequelize.getQueryInterface().dropTable('cast_member_video');
};
