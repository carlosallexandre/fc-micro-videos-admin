import {
  Model,
  Table,
  PrimaryKey,
  Column,
  DataType,
  ForeignKey,
} from 'sequelize-typescript';
import { Uuid } from '@core/@shared/domain/value-objects/uuid.vo';
import { AudioVideoMediaStatus } from '@core/video/domain/audio-video-media.vo';
import { VideoModel } from './video.model';

export enum AudioVideoMediaRelatedField {
  TRAILER = 'trailer',
  VIDEO = 'video',
}

export class AudioVideoMediaModelProps {
  audio_video_media_id: string;
  name: string;
  raw_location: string;
  encoded_location: string | null;
  status: AudioVideoMediaStatus;
  video_id: string;
  video_related_field: AudioVideoMediaRelatedField;
}

@Table({
  tableName: 'audio_video_medias',
  timestamps: false,
  indexes: [{ fields: ['video_id', 'video_related_field'], unique: true }],
})
export class AudioVideoMediaModel extends Model<AudioVideoMediaModelProps> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: () => new Uuid().value })
  declare audio_video_media_id: string;

  @Column({ allowNull: false, type: DataType.STRING(255) })
  declare name: string;

  @Column({ allowNull: false, type: DataType.STRING(255) })
  declare raw_location: string;

  @Column({ allowNull: true, type: DataType.STRING(255) })
  declare encoded_location: string | null;

  @Column({
    allowNull: false,
    type: DataType.ENUM(
      AudioVideoMediaStatus.PENDING,
      AudioVideoMediaStatus.PROCESSING,
      AudioVideoMediaStatus.COMPLETED,
      AudioVideoMediaStatus.FAILED,
    ),
  })
  declare status: AudioVideoMediaStatus;

  @ForeignKey(() => VideoModel)
  @Column({ allowNull: false, type: DataType.UUID })
  declare video_id: string;

  @Column({ allowNull: false, type: DataType.STRING(20) })
  declare video_related_field: AudioVideoMediaRelatedField;
}
