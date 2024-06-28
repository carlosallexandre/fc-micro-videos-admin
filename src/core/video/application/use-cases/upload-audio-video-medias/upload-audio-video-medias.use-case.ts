import { IUseCase } from '@core/@shared/application/use-case.interface';
import { UploadAudioVideoMediaInput } from './upload-audio-video-medias.input';
import { IVideoRepository } from '@core/video/domain/video.repository';
import { IStorage } from '@core/@shared/application/storage.interface';
import { EntityValidationError } from '@core/@shared/domain/errors/validation.error';
import { Trailer } from '@core/video/domain/trailer.vo';
import { VideoId } from '@core/video/domain/video-id.vo';
import { VideoMedia } from '@core/video/domain/video-media.vo';
import { Video } from '@core/video/domain/video.aggregate';
import { NotFoundError } from '@core/@shared/domain/errors/not-found.error';
import { ApplicationService } from '@core/@shared/application/application.service';

export class UploadAudioVideoMediasUseCase
  implements IUseCase<UploadAudioVideoMediaInput, UploadAudioVideoMediaOutput>
{
  constructor(
    private appService: ApplicationService,
    private videoRepo: IVideoRepository,
    private storage: IStorage,
  ) {}

  async execute(
    input: UploadAudioVideoMediaInput,
  ): Promise<UploadAudioVideoMediaOutput> {
    const video = await this.videoRepo.findById(new VideoId(input.video_id));
    if (!video) {
      throw new NotFoundError(input.video_id, Video);
    }

    const audioVideoMediaMap = {
      trailer: Trailer,
      video: VideoMedia,
    };

    const audioMediaClass = audioVideoMediaMap[input.field];
    const eitherMedia = audioMediaClass.createFromFile({
      ...input.file,
      video_id: video.video_id,
    });

    if (eitherMedia.isFail()) {
      throw new EntityValidationError([
        { [input.field]: [eitherMedia.error.message] },
      ]);
    }

    eitherMedia.ok instanceof Trailer && video.replaceTrailer(eitherMedia.ok);
    eitherMedia.ok instanceof VideoMedia && video.replaceVideo(eitherMedia.ok);

    await this.storage.store({
      data: input.file.data,
      id: eitherMedia.ok.raw_url,
      mime_type: input.file.mime_type,
    });

    await this.appService.run(() => this.videoRepo.update(video));
  }
}

export type UploadAudioVideoMediaOutput = void;
