import { IsNotEmpty, IsString, IsUUID, IsIn } from 'class-validator';
import { AudioVideoMediaStatus } from '@core/video/domain/audio-video-media.vo';

export type ProcessAudioVideoMediasInputConstructorProps = {
  video_id: string;
  encoded_location: string;
  field: 'trailer' | 'video';
  status: AudioVideoMediaStatus;
};

export class ProcessAudioVideoMediasInput {
  @IsUUID('4')
  @IsString()
  @IsNotEmpty()
  video_id: string;

  @IsNotEmpty()
  encoded_location: string;

  @IsIn(['trailer', 'video'])
  @IsNotEmpty()
  field: 'trailer' | 'video';

  @IsIn([AudioVideoMediaStatus.COMPLETED, AudioVideoMediaStatus.FAILED])
  @IsNotEmpty()
  status: AudioVideoMediaStatus;

  constructor(props?: ProcessAudioVideoMediasInputConstructorProps) {
    Object.assign(this, props ?? {});
  }
}
