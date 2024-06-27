import { IUseCase } from '@core/@shared/application/use-case.interface';
import { ICastMemberRepository } from '@core/cast-member/domain/cast-member.repository';
import { ICategoryRepository } from '@core/category/domain/category.repository';
import { IGenreRepository } from '@core/genre/domain/genre.repository';
import { VideoId } from '@core/video/domain/video-id.vo';
import { Video } from '@core/video/domain/video.aggregate';
import { IVideoRepository } from '@core/video/domain/video.repository';
import { VideoOutputMapper, VideoOutput } from '../common/video.output';
import { NotFoundError } from '@core/@shared/domain/errors/not-found.error';

export class GetVideoUseCase
  implements IUseCase<GetVideoInput, GetVideoOutput>
{
  constructor(
    private videoRepo: IVideoRepository,
    private categoryRepo: ICategoryRepository,
    private genreRepo: IGenreRepository,
    private castMemberRepo: ICastMemberRepository,
  ) {}

  async execute(input: GetVideoInput): Promise<GetVideoOutput> {
    const videoId = new VideoId(input.id);
    const video = await this.videoRepo.findById(videoId);
    if (!video) {
      throw new NotFoundError(input.id, Video);
    }
    const genres = await this.genreRepo.findByIds(
      Array.from(video.genres_id.values()),
    );

    const categories = await this.categoryRepo.findByIds(
      Array.from(video.categories_id.values()).concat(
        genres.flatMap((g) => Array.from(g.categories_id.values())),
      ),
    );

    const castMembers = await this.castMemberRepo.findByIds(
      Array.from(video.cast_members_id.values()),
    );

    return VideoOutputMapper.toOutput({
      video,
      genres,
      cast_members: castMembers,
      allCategoriesOfVideoAndGenre: categories,
    });
  }
}

export type GetVideoInput = {
  id: string;
};

export type GetVideoOutput = VideoOutput;
