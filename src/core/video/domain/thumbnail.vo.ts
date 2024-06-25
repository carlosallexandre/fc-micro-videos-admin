import { Either } from '@core/@shared/domain/either';
import { ImageMedia } from './image-media.vo';
import {
  MediaFileValidator,
  InvalidMediaFileSizeError,
  InvalidMediaFileMimeTypeError,
} from './media-file.validator';
import { VideoId } from './video-id.vo';

export class Thumbnail extends ImageMedia {
  static max_size = 1024 * 1024 * 2;
  static mime_types = ['image/jpeg', 'image/png'];

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
    const mediaFileValidator = new MediaFileValidator(
      Thumbnail.max_size,
      Thumbnail.mime_types,
    );
    return Either.safe<
      InvalidMediaFileSizeError | InvalidMediaFileMimeTypeError,
      Thumbnail
    >(() => {
      const { name } = mediaFileValidator.validate({
        raw_name,
        mime_type,
        size,
      });
      return new Thumbnail({
        name: `${video_id.value}-${name}`,
        location: `videos/${video_id.value}/images`,
      });
    });
  }
}
