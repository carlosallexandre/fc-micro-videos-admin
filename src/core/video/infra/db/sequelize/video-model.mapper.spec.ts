import { LoadEntityError } from '@core/@shared/domain/errors/validation.error';
import { CastMember } from '@core/cast-member/domain/cast-member.aggregate';
import { ICastMemberRepository } from '@core/cast-member/domain/cast-member.repository';
import { CastMemberSequelizeRepository } from '@core/cast-member/infra/db/sequelize/cast-member-sequelize.repository';
import { CastMemberModel } from '@core/cast-member/infra/db/sequelize/cast-member.model';
import { Category } from '@core/category/domain/category.aggregate';
import { ICategoryRepository } from '@core/category/domain/category.repository';
import { CategoryModel } from '@core/category/infra/db/sequelize/category.model';
import { CategorySequelizeRepository } from '@core/category/infra/db/sequelize/category.repository';
import { Genre } from '@core/genre/domain/genre.aggregate';
import { IGenreRepository } from '@core/genre/domain/genre.repository';
import { GenreSequelizeRepository } from '@core/genre/infra/db/sequelize/genre-sequelize.repository';
import { GenreModel } from '@core/genre/infra/db/sequelize/genre.model';
import { AudioVideoMediaStatus } from '@core/video/domain/audio-video-media.vo';
import { Banner } from '@core/video/domain/banner.vo';
import { RatingValues, Rating } from '@core/video/domain/rating.vo';
import { ThumbnailHalf } from '@core/video/domain/thumbnail-half.vo';
import { Thumbnail } from '@core/video/domain/thumbnail.vo';
import { Trailer } from '@core/video/domain/trailer.vo';
import { VideoId } from '@core/video/domain/video-id.vo';
import { VideoMedia } from '@core/video/domain/video-media.vo';
import { Video } from '@core/video/domain/video.aggregate';
import {
  AudioVideoMediaModel,
  AudioVideoMediaRelatedField,
} from './audio-video-media.model';
import { ImageMediaModel, ImageMediaRelatedField } from './image-media.model';
import { setupSequelizeForVideo } from './testing/helpers';
import { VideoModelMapper } from './video-model.mapper';
import {
  VideoModel,
  VideoCategoryModel,
  VideoGenreModel,
  VideoCastMemberModel,
} from './video.model';
import { UnitOfWorkInMemory } from '@core/@shared/infra/db/in-memory/in-memory-unit-of-work';

describe('VideoModelMapper Unit Tests', () => {
  let categoryRepo: ICategoryRepository;
  let genreRepo: IGenreRepository;
  let castMemberRepo: ICastMemberRepository;
  setupSequelizeForVideo();

  beforeEach(() => {
    categoryRepo = new CategorySequelizeRepository(CategoryModel);
    castMemberRepo = new CastMemberSequelizeRepository(CastMemberModel);
    genreRepo = new GenreSequelizeRepository(
      GenreModel,
      new UnitOfWorkInMemory() as any,
    );
  });

  it('should throws error when video is invalid', () => {
    const arrange = [
      {
        makeModel: () => {
          return VideoModel.build({
            video_id: '9366b7dc-2d71-4799-b91c-c64adb205104',
            title: 't'.repeat(256),
            categories_id: [],
            genres_id: [],
            cast_members_id: [],
          } as any);
        },
        expectedErrors: [
          {
            categories_id: ['categories_id should not be empty'],
          },
          {
            genres_id: ['genres_id should not be empty'],
          },
          {
            cast_members_id: ['cast_members_id should not be empty'],
          },
          {
            rating: [
              `The rating must be one of the following values: ${Object.values(
                RatingValues,
              ).join(', ')}, passed value: undefined`,
            ],
          },
          {
            title: ['title must be shorter than or equal to 255 characters'],
          },
        ],
      },
    ];

    for (const item of arrange) {
      try {
        VideoModelMapper.toEntity(item.makeModel());
        fail('The genre is valid, but it needs throws a LoadEntityError');
      } catch (e) {
        expect(e).toBeInstanceOf(LoadEntityError);
        expect(e.error).toMatchObject(item.expectedErrors);
      }
    }
  });

  it('should convert a video model to a video entity', async () => {
    const category1 = Category.fake().aCategory().build();
    await categoryRepo.bulkInsert([category1]);
    const genre1 = Genre.fake()
      .aGenre()
      .addCategoryId(category1.category_id)
      .build();
    await genreRepo.bulkInsert([genre1]);
    const castMember1 = CastMember.fake().anActor().build();
    await castMemberRepo.bulkInsert([castMember1]);

    const videoProps = {
      video_id: new VideoId().value,
      title: 'title',
      description: 'description',
      year_launched: 2020,
      duration: 90,
      rating: RatingValues.R10,
      is_opened: false,
      is_published: false,
      created_at: new Date(),
    };

    let model = await VideoModel.create(
      {
        ...videoProps,
        categories_id: [
          VideoCategoryModel.build({
            video_id: videoProps.video_id,
            category_id: category1.category_id.value,
          }),
        ],
        genres_id: [
          VideoGenreModel.build({
            video_id: videoProps.video_id,
            genre_id: genre1.id.value,
          }),
        ],
        cast_members_id: [
          VideoCastMemberModel.build({
            video_id: videoProps.video_id,
            cast_member_id: castMember1.id.value,
          }),
        ],
      } as any,
      { include: ['categories_id', 'genres_id', 'cast_members_id'] },
    );
    let entity = VideoModelMapper.toEntity(model);
    expect(entity.toJSON()).toEqual(
      new Video({
        video_id: new VideoId(model.video_id),
        title: videoProps.title,
        description: videoProps.description,
        year_launched: videoProps.year_launched,
        duration: videoProps.duration,
        rating: Rating.create10(),
        is_opened: videoProps.is_opened,
        is_published: videoProps.is_published,
        created_at: videoProps.created_at,
        categories_id: new Map([[category1.id.value, category1.category_id]]),
        genres_id: new Map([[genre1.id.value, genre1.id]]),
        cast_members_id: new Map([[castMember1.id.value, castMember1.id]]),
      }).toJSON(),
    );

    videoProps.video_id = new VideoId().value;
    model = await VideoModel.create(
      {
        ...videoProps,
        image_medias: [
          ImageMediaModel.build({
            video_id: videoProps.video_id,
            location: 'location banner',
            name: 'name banner',
            video_related_field: ImageMediaRelatedField.BANNER,
          } as any),
          ImageMediaModel.build({
            video_id: videoProps.video_id,
            location: 'location thumbnail',
            name: 'name thumbnail',
            video_related_field: ImageMediaRelatedField.THUMBNAIL,
          } as any),
          ImageMediaModel.build({
            video_id: videoProps.video_id,
            location: 'location thumbnail half',
            name: 'name thumbnail half',
            video_related_field: ImageMediaRelatedField.THUMBNAIL_HALF,
          } as any),
        ],
        audio_video_medias: [
          AudioVideoMediaModel.build({
            video_id: videoProps.video_id,
            name: 'name trailer',
            raw_location: 'raw_location trailer',
            encoded_location: 'encoded_location trailer',
            status: AudioVideoMediaStatus.COMPLETED,
            video_related_field: AudioVideoMediaRelatedField.TRAILER,
          } as any),
          AudioVideoMediaModel.build({
            video_id: videoProps.video_id,
            name: 'name video',
            raw_location: 'raw_location video',
            encoded_location: 'encoded_location video',
            status: AudioVideoMediaStatus.COMPLETED,
            video_related_field: AudioVideoMediaRelatedField.VIDEO,
          } as any),
        ],
        categories_id: [
          VideoCategoryModel.build({
            video_id: videoProps.video_id,
            category_id: category1.id.value,
          }),
        ],
        genres_id: [
          VideoGenreModel.build({
            video_id: videoProps.video_id,
            genre_id: genre1.id.value,
          }),
        ],
        cast_members_id: [
          VideoCastMemberModel.build({
            video_id: videoProps.video_id,
            cast_member_id: castMember1.id.value,
          }),
        ],
      },
      {
        include: [
          'categories_id',
          'genres_id',
          'cast_members_id',
          'image_medias',
          'audio_video_medias',
        ],
      },
    );

    entity = VideoModelMapper.toEntity(model);
    expect(entity.toJSON()).toEqual(
      new Video({
        video_id: new VideoId(model.video_id),
        title: videoProps.title,
        description: videoProps.description,
        year_launched: videoProps.year_launched,
        duration: videoProps.duration,
        rating: Rating.create10(),
        is_opened: videoProps.is_opened,
        is_published: videoProps.is_published,
        created_at: videoProps.created_at,
        banner: new Banner({
          location: 'location banner',
          name: 'name banner',
        }),
        thumbnail: new Thumbnail({
          location: 'location thumbnail',
          name: 'name thumbnail',
        }),
        thumbnail_half: new ThumbnailHalf({
          location: 'location thumbnail half',
          name: 'name thumbnail half',
        }),
        trailer: new Trailer({
          name: 'name trailer',
          raw_location: 'raw_location trailer',
          encoded_location: 'encoded_location trailer',
          status: AudioVideoMediaStatus.COMPLETED,
        }),
        video: new VideoMedia({
          name: 'name video',
          raw_location: 'raw_location video',
          encoded_location: 'encoded_location video',
          status: AudioVideoMediaStatus.COMPLETED,
        }),
        categories_id: new Map([[category1.id.value, category1.category_id]]),
        genres_id: new Map([[genre1.id.value, genre1.id]]),
        cast_members_id: new Map([[castMember1.id.value, castMember1.id]]),
      }).toJSON(),
    );
  });

  it('should convert a video entity to a video model', async () => {
    const category1 = Category.fake().aCategory().build();
    await categoryRepo.bulkInsert([category1]);
    const genre1 = Genre.fake()
      .aGenre()
      .addCategoryId(category1.category_id)
      .build();
    await genreRepo.bulkInsert([genre1]);
    const castMember1 = CastMember.fake().anActor().build();
    await castMemberRepo.bulkInsert([castMember1]);

    const videoProps = {
      video_id: new VideoId(),
      title: 'title',
      description: 'description',
      year_launched: 2020,
      duration: 90,
      rating: Rating.create10(),
      is_opened: false,
      is_published: false,
      created_at: new Date(),
    };

    let entity = new Video({
      ...videoProps,
      categories_id: new Map([[category1.id.value, category1.category_id]]),
      genres_id: new Map([[genre1.id.value, genre1.id]]),
      cast_members_id: new Map([[castMember1.id.value, castMember1.id]]),
    });

    const model = VideoModelMapper.toModelProps(entity);
    expect(model).toEqual({
      video_id: videoProps.video_id.value,
      title: videoProps.title,
      description: videoProps.description,
      year_launched: videoProps.year_launched,
      duration: videoProps.duration,
      rating: videoProps.rating.value,
      is_opened: videoProps.is_opened,
      is_published: videoProps.is_published,
      created_at: videoProps.created_at,
      audio_video_medias: [],
      image_medias: [],
      categories_id: [
        VideoCategoryModel.build({
          video_id: videoProps.video_id.value,
          category_id: category1.category_id.value,
        }),
      ],
      genres_id: [
        VideoGenreModel.build({
          video_id: videoProps.video_id.value,
          genre_id: genre1.id.value,
        }),
      ],
      cast_members_id: [
        VideoCastMemberModel.build({
          video_id: videoProps.video_id.value,
          cast_member_id: castMember1.id.value,
        }),
      ],
    });

    entity = new Video({
      ...videoProps,
      banner: new Banner({
        location: 'location banner',
        name: 'name banner',
      }),
      thumbnail: new Thumbnail({
        location: 'location thumbnail',
        name: 'name thumbnail',
      }),
      thumbnail_half: new ThumbnailHalf({
        location: 'location thumbnail half',
        name: 'name thumbnail half',
      }),
      trailer: new Trailer({
        name: 'name trailer',
        raw_location: 'raw_location trailer',
        encoded_location: 'encoded_location trailer',
        status: AudioVideoMediaStatus.COMPLETED,
      }),
      video: new VideoMedia({
        name: 'name video',
        raw_location: 'raw_location video',
        encoded_location: 'encoded_location video',
        status: AudioVideoMediaStatus.COMPLETED,
      }),
      categories_id: new Map([
        [category1.category_id.value, category1.category_id],
      ]),
      genres_id: new Map([[genre1.id.value, genre1.id]]),
      cast_members_id: new Map([[castMember1.id.value, castMember1.id]]),
    });

    const model2 = VideoModelMapper.toModelProps(entity);
    expect(model2.video_id).toEqual(videoProps.video_id.value);
    expect(model2.title).toEqual(videoProps.title);
    expect(model2.description).toEqual(videoProps.description);
    expect(model2.year_launched).toEqual(videoProps.year_launched);
    expect(model2.duration).toEqual(videoProps.duration);
    expect(model2.rating).toEqual(videoProps.rating.value);
    expect(model2.is_opened).toEqual(videoProps.is_opened);
    expect(model2.is_published).toEqual(videoProps.is_published);
    expect(model2.created_at).toEqual(videoProps.created_at);
    expect(model2.audio_video_medias[0]!.toJSON()).toEqual({
      audio_video_media_id: model2.audio_video_medias[0]!.audio_video_media_id,
      video_id: videoProps.video_id.value,
      name: 'name trailer',
      raw_location: 'raw_location trailer',
      encoded_location: 'encoded_location trailer',
      status: AudioVideoMediaStatus.COMPLETED,
      video_related_field: AudioVideoMediaRelatedField.TRAILER,
    });
    expect(model2.audio_video_medias[1]!.toJSON()).toEqual({
      audio_video_media_id: model2.audio_video_medias[1]!.audio_video_media_id,
      video_id: videoProps.video_id.value,
      name: 'name video',
      raw_location: 'raw_location video',
      encoded_location: 'encoded_location video',
      status: AudioVideoMediaStatus.COMPLETED,
      video_related_field: AudioVideoMediaRelatedField.VIDEO,
    });
    expect(model2.image_medias[0]!.toJSON()).toEqual({
      image_media_id: model2.image_medias[0]!.image_media_id,
      video_id: videoProps.video_id.value,
      location: 'location banner',
      name: 'name banner',
      video_related_field: ImageMediaRelatedField.BANNER,
    });
    expect(model2.image_medias[1]!.toJSON()).toEqual({
      image_media_id: model2.image_medias[1]!.image_media_id,
      video_id: videoProps.video_id.value,
      location: 'location thumbnail',
      name: 'name thumbnail',
      video_related_field: ImageMediaRelatedField.THUMBNAIL,
    });
    expect(model2.image_medias[2]!.toJSON()).toEqual({
      image_media_id: model2.image_medias[2]!.image_media_id,
      video_id: videoProps.video_id.value,
      location: 'location thumbnail half',
      name: 'name thumbnail half',
      video_related_field: ImageMediaRelatedField.THUMBNAIL_HALF,
    });
    expect(model2.categories_id[0].toJSON()).toEqual({
      video_id: videoProps.video_id.value,
      category_id: category1.category_id.value,
    });
    expect(model2.genres_id[0].toJSON()).toEqual({
      video_id: videoProps.video_id.value,
      genre_id: genre1.id.value,
    });
    expect(model2.cast_members_id[0].toJSON()).toEqual({
      video_id: videoProps.video_id.value,
      cast_member_id: castMember1.id.value,
    });
  });
});
