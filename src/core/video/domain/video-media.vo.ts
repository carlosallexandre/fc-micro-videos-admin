import { Either } from '@core/@shared/domain/either';
import { AudioVideoMedia, AudioVideoMediaStatus } from './audio-video-media.vo';
import {
  InvalidMediaFileMimeTypeError,
  InvalidMediaFileSizeError,
  MediaFileValidator,
} from './media-file.validator';
import { VideoId } from './video-id.vo';

export class VideoMedia extends AudioVideoMedia {
  static max_size = 1024 * 1024 * 1024 * 50; // 50GB
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
      VideoMedia
    >(() => {
      const mediaFileValidator = new MediaFileValidator(
        VideoMedia.max_size,
        VideoMedia.mime_types,
      );
      const { name: newName } = mediaFileValidator.validate({
        raw_name,
        mime_type,
        size,
      });
      return VideoMedia.create({
        name: `${video_id.value}-${newName}`,
        raw_location: `videos/${video_id.value}/videos`,
      });
    });
  }

  static create({ name, raw_location }) {
    return new VideoMedia({
      name,
      raw_location,
      status: AudioVideoMediaStatus.PENDING,
    });
  }

  process() {
    return new VideoMedia({
      name: this.name,
      raw_location: this.raw_location,
      encoded_location: this.encoded_location!,
      status: AudioVideoMediaStatus.PROCESSING,
    });
  }

  complete(encoded_location: string) {
    return new VideoMedia({
      name: this.name,
      raw_location: this.raw_location,
      encoded_location,
      status: AudioVideoMediaStatus.COMPLETED,
    });
  }

  fail() {
    return new VideoMedia({
      name: this.name,
      raw_location: this.raw_location,
      encoded_location: this.encoded_location!,
      status: AudioVideoMediaStatus.FAILED,
    });
  }
}
