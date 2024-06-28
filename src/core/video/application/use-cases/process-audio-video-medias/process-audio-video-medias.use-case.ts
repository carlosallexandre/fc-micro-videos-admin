import { IUseCase } from '@core/@shared/application/use-case.interface';
import { IUnitOfWork } from '@core/@shared/domain/repository/unit-of-work.interface';
import { AudioVideoMediaStatus } from '@core/video/domain/audio-video-media.vo';
import { VideoId } from '@core/video/domain/video-id.vo';
import { Video } from '@core/video/domain/video.aggregate';
import { IVideoRepository } from '@core/video/domain/video.repository';
import { ProcessAudioVideoMediasInput } from './process-audio-video-medias.input';
import { NotFoundError } from '@core/@shared/domain/errors/not-found.error';

export class ProcessAudioVideoMediasUseCase
  implements
    IUseCase<ProcessAudioVideoMediasInput, ProcessAudioVideoMediasOutput>
{
  constructor(
    private uow: IUnitOfWork,
    private videoRepo: IVideoRepository,
  ) {}

  async execute(input: ProcessAudioVideoMediasInput) {
    const videoId = new VideoId(input.video_id);
    const video = await this.videoRepo.findById(videoId);

    if (!video) {
      throw new NotFoundError(input.video_id, Video);
    }

    if (!video[input.field]) {
      throw new Error(`${input.field} not found`);
    }

    video[input.field] =
      input.status === AudioVideoMediaStatus.COMPLETED
        ? video[input.field].complete(input.encoded_location)
        : video[input.field].fail();

    await this.uow.do(() => this.videoRepo.update(video));
  }
}

type ProcessAudioVideoMediasOutput = void;
