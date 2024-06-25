import { SortDirection } from '@core/@shared/domain/repository/search-params';
import { InMemorySearchableRepository } from '@core/@shared/infra/db/in-memory/in-memory-searchable.repository';
import { VideoId } from '@core/video/domain/video-id.vo';
import { Video } from '@core/video/domain/video.aggregate';
import {
  VideoFilter,
  IVideoRepository,
  VideoSearchParams,
} from '@core/video/domain/video.repository';

export class VideoInMemoryRepository
  extends InMemorySearchableRepository<Video, VideoId, VideoFilter>
  implements IVideoRepository
{
  sortableFields: string[] = ['title', 'created_at'];

  getEntity(): new (...args: any[]) => Video {
    return Video;
  }

  protected applyFilter(items: Video[], params: VideoSearchParams): Video[] {
    const filter = params?.filter;

    if (!filter) {
      return items;
    }

    return items.filter((i) => {
      const containsTitle =
        filter.title &&
        i.title.toLowerCase().includes(filter.title.toLowerCase());
      const containsCategoriesId =
        filter.categories_id &&
        filter.categories_id.some((c) => i.categories_id.has(c.value));
      const containsGenresId =
        filter.genres_id &&
        filter.genres_id.some((c) => i.genres_id.has(c.value));
      const containsCastMembersId =
        filter.cast_members_id &&
        filter.cast_members_id.some((c) => i.cast_members_id.has(c.value));

      const filterMap = [
        [filter.title, containsTitle],
        [filter.categories_id, containsCategoriesId],
        [filter.genres_id, containsGenresId],
        [filter.cast_members_id, containsCastMembersId],
      ].filter((i) => i[0]);

      return filterMap.every((i) => i[1]);
    });
  }

  protected applySort(items: Video[], params: VideoSearchParams): Video[] {
    const sort = params.sort;
    return !sort
      ? super.applySort(
          items,
          VideoSearchParams.create({
            ...params,
            sort: 'created_at',
            sort_dir: 'desc',
          }),
        )
      : super.applySort(items, params);
  }
}
