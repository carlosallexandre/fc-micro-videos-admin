import { CastMember } from '@core/cast-member/domain/cast-member.aggregate';
import { Category } from '@core/category/domain/category.aggregate';
import { Genre } from '@core/genre/domain/genre.aggregate';
import { Video } from '@core/video/domain/video.aggregate';
import { VideoOutputMapper } from './video.output';

describe('VideoOutputMapper Unit Tests', () => {
  it('should convert a video in output', () => {
    const categories = Category.fake().theCategories(2).build();
    const genres = Genre.fake().theGenres(2).build();
    genres[0].syncCategoriesId([categories[0].category_id]);
    genres[1].syncCategoriesId([categories[1].category_id]);
    const castMembers = CastMember.fake().theCastMembers(2).build();

    const entity = Video.fake()
      .aVideoWithAllMedias()
      .addCategoryId(categories[0].category_id)
      .addCategoryId(categories[1].category_id)
      .addGenreId(genres[0].genre_id)
      .addGenreId(genres[1].genre_id)
      .addCastMemberId(castMembers[0].cast_member_id)
      .addCastMemberId(castMembers[1].cast_member_id)
      .build();
    const output = VideoOutputMapper.toOutput({
      video: entity,
      genres,
      cast_members: castMembers,
      allCategoriesOfVideoAndGenre: categories,
    });
    expect(output).toEqual({
      id: entity.video_id.value,
      title: entity.title,
      description: entity.description,
      year_launched: entity.year_launched,
      duration: entity.duration,
      rating: entity.rating.value,
      is_opened: entity.is_opened,
      is_published: entity.is_published,
      categories_id: [
        categories[0].category_id.value,
        categories[1].category_id.value,
      ],
      categories: [
        {
          id: categories[0].category_id.value,
          name: categories[0].name,
          created_at: categories[0].created_at,
        },
        {
          id: categories[1].category_id.value,
          name: categories[1].name,
          created_at: categories[1].created_at,
        },
      ],
      genres_id: [genres[0].genre_id.value, genres[1].genre_id.value],
      genres: [
        {
          id: genres[0].genre_id.value,
          name: genres[0].name,
          is_active: genres[0].is_active,
          categories_id: [categories[0].category_id.value],
          categories: [
            {
              id: categories[0].category_id.value,
              name: categories[0].name,
              created_at: categories[0].created_at,
            },
          ],
          created_at: genres[0].created_at,
        },
        {
          id: genres[1].genre_id.value,
          name: genres[1].name,
          is_active: genres[1].is_active,
          categories_id: [categories[1].category_id.value],
          categories: [
            {
              id: categories[1].category_id.value,
              name: categories[1].name,
              created_at: categories[1].created_at,
            },
          ],
          created_at: genres[1].created_at,
        },
      ],
      cast_members_id: [
        castMembers[0].cast_member_id.value,
        castMembers[1].cast_member_id.value,
      ],
      cast_members: [
        {
          id: castMembers[0].cast_member_id.value,
          name: castMembers[0].name,
          type: castMembers[0].type.value,
          created_at: castMembers[0].created_at,
        },
        {
          id: castMembers[1].cast_member_id.value,
          name: castMembers[1].name,
          type: castMembers[1].type.value,
          created_at: castMembers[1].created_at,
        },
      ],
      created_at: entity.created_at,
    });
  });
});
