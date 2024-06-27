import { Banner } from './banner.vo';
import {
  InvalidMediaFileSizeError,
  InvalidMediaFileMimeTypeError,
} from './media-file.validator';
import { VideoId } from './video-id.vo';

describe('Banner Unit Tests', () => {
  it('should create a Banner object from a valid file', () => {
    const data = Buffer.alloc(1024);
    const videoId = new VideoId();
    const result = Banner.createFromFile({
      raw_name: 'test.png',
      mime_type: 'image/png',
      size: data.length,
      video_id: videoId,
    });
    const error = result.error;
    const banner = result.ok;

    expect(error).toBeNull();
    expect(banner).toBeInstanceOf(Banner);
    expect(banner.name).toMatch(/\.png$/);
    expect(banner.location).toBe(`videos/${videoId.value}/images`);
  });

  it('should throw an error if the file size is too large', () => {
    const data = Buffer.alloc(Banner.max_size + 1);
    const videoId = new VideoId();
    const [error, banner] = Banner.createFromFile({
      raw_name: 'test.png',
      mime_type: 'image/png',
      size: data.length,
      video_id: videoId,
    });

    expect(banner).toBeNull();
    expect(error).toBeInstanceOf(InvalidMediaFileSizeError);
  });

  it('should throw an error if the file mime type is not valid', () => {
    const data = Buffer.alloc(1024);
    const videoId = new VideoId();
    const [error, banner] = Banner.createFromFile({
      raw_name: 'test.txt',
      mime_type: 'text/plain',
      size: data.length,
      video_id: videoId,
    });

    expect(banner).toBeNull();
    expect(error).toBeInstanceOf(InvalidMediaFileMimeTypeError);
  });
});
