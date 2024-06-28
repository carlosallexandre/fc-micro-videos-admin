import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsIn,
  ValidateNested,
} from 'class-validator';
import { FileMediaInput } from '../common/file-media.input';

export type UploadAudioVideoMediaInputConstructorProps = {
  video_id: string;
  field: 'trailer' | 'video';
  file: FileMediaInput;
};

export class UploadAudioVideoMediaInput {
  @IsUUID('4')
  @IsString()
  @IsNotEmpty()
  video_id: string;

  @IsIn(['trailer', 'video'])
  @IsNotEmpty()
  field: 'trailer' | 'video';

  @ValidateNested()
  file: FileMediaInput;

  constructor(props?: UploadAudioVideoMediaInputConstructorProps) {
    Object.assign(this, props ?? {});
  }
}
