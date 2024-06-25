import { Either } from '@core/@shared/domain/either';
import { ImageMedia } from './image-media.vo';
import {
  InvalidMediaFileMimeTypeError,
  InvalidMediaFileSizeError,
  MediaFileValidator,
} from './media-file.validator';
import { VideoId } from './video-id.vo';

export class Banner extends ImageMedia {
  static max_size = 1024 * 1024 * 2; // 2MB
  static mime_types = ['image/jpeg', 'image/png', 'image/gif'];

  static createFromFile({
    raw_name,
    mime_type,
    size,
    video_id,
  }: {
    raw_name: string;
    mime_type: string;
    size: number;
    video_id: VideoId;
  }) {
    return Either.safe<
      InvalidMediaFileSizeError | InvalidMediaFileMimeTypeError,
      Banner
    >(() => {
      const mediaFileValidator = new MediaFileValidator(
        Banner.max_size,
        Banner.mime_types,
      );
      const { name: newName } = mediaFileValidator.validate({
        raw_name,
        mime_type,
        size,
      });
      return new Banner({
        name: newName,
        location: `videos/${video_id.value}/imagens`,
      });
    });
  }
}
