import { Either } from '@core/@shared/domain/either';
import { VideoId } from './video-id.vo';
import { AudioVideoMedia, AudioVideoMediaStatus } from './audio-video-media.vo';
import {
  InvalidMediaFileMimeTypeError,
  InvalidMediaFileSizeError,
  MediaFileValidator,
} from './media-file.validator';

export class Trailer extends AudioVideoMedia {
  static max_size = 1024 * 1024 * 500; // 50MB
  static mime_types = ['video/mp4'];

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
      Trailer
    >(() => {
      const mediaFileValidator = new MediaFileValidator(
        Trailer.max_size,
        Trailer.mime_types,
      );
      const { name: newName } = mediaFileValidator.validate({
        raw_name,
        mime_type,
        size,
      });
      return Trailer.create({
        name: `${video_id.value}-${newName}`,
        raw_location: `videos/${video_id.value}/videos`,
      });
    });
  }

  static create({ name, raw_location }) {
    return new Trailer({
      name,
      raw_location,
      status: AudioVideoMediaStatus.PENDING,
    });
  }

  process() {
    return new Trailer({
      name: this.name,
      raw_location: this.raw_location,
      encoded_location: this.encoded_location!,
      status: AudioVideoMediaStatus.PROCESSING,
    });
  }

  complete(encoded_location: string) {
    return new Trailer({
      name: this.name,
      raw_location: this.raw_location,
      encoded_location,
      status: AudioVideoMediaStatus.COMPLETED,
    });
  }

  fail() {
    return new Trailer({
      name: this.name,
      raw_location: this.raw_location,
      encoded_location: this.encoded_location!,
      status: AudioVideoMediaStatus.FAILED,
    });
  }
}
