import { UnitOfWorkSequelize } from '@core/@shared/infra/db/sequelize/unit-of-work-sequelize';
import { CreateVideoUseCase } from './create-video.use-case';
import { CastMembersIdExistsInDatabaseValidator } from '@core/cast-member/application/validations/cast-members-id-exists-in-database.validator';
import { CastMember } from '@core/cast-member/domain/cast-member.aggregate';
import { CastMemberSequelizeRepository } from '@core/cast-member/infra/db/sequelize/cast-member-sequelize.repository';
import { CastMemberModel } from '@core/cast-member/infra/db/sequelize/cast-member.model';
import { Category } from '@core/category/domain/category.aggregate';
import { CategoryModel } from '@core/category/infra/db/sequelize/category.model';
import { CategorySequelizeRepository } from '@core/category/infra/db/sequelize/category.repository';
import { GenresIdExistsInDatabaseValidator } from '@core/genre/application/validations/genres-id-exists-in-database.validator';
import { Genre } from '@core/genre/domain/genre.aggregate';
import { GenreSequelizeRepository } from '@core/genre/infra/db/sequelize/genre-sequelize.repository';
import { GenreModel } from '@core/genre/infra/db/sequelize/genre.model';
import { RatingValues } from '@core/video/domain/rating.vo';
import { VideoId } from '@core/video/domain/video-id.vo';
import { Video } from '@core/video/domain/video.aggregate';
import { setupSequelizeForVideo } from '@core/video/infra/db/sequelize/testing/helpers';
import { VideoSequelizeRepository } from '@core/video/infra/db/sequelize/video-sequelize.repository';
import { VideoModel } from '@core/video/infra/db/sequelize/video.model';
import { DatabaseError } from 'sequelize';
import { CategoriesIdExistsInStorageValidator } from '@core/category/application/validations/categories-ids-exists-in-storage';

describe('CreateVideoUseCase Integration Tests', () => {
  let uow: UnitOfWorkSequelize;
  let useCase: CreateVideoUseCase;

  let videoRepo: VideoSequelizeRepository;
  let genreRepo: GenreSequelizeRepository;
  let castMemberRepo: CastMemberSequelizeRepository;

  let categoryRepo: CategorySequelizeRepository;
  let categoriesIdsValidator: CategoriesIdExistsInStorageValidator;
  let genresIdsValidator: GenresIdExistsInDatabaseValidator;
  let castMembersIdsValidator: CastMembersIdExistsInDatabaseValidator;

  const sequelizeHelper = setupSequelizeForVideo();

  // prettier-ignore
  beforeEach(() => {
    uow = new UnitOfWorkSequelize(sequelizeHelper.sequelize);
    videoRepo = new VideoSequelizeRepository(VideoModel, uow);
    genreRepo = new GenreSequelizeRepository(GenreModel, uow);
    categoryRepo = new CategorySequelizeRepository(CategoryModel);
    castMemberRepo = new CastMemberSequelizeRepository(CastMemberModel);
    genresIdsValidator = new GenresIdExistsInDatabaseValidator(genreRepo);
    categoriesIdsValidator = new CategoriesIdExistsInStorageValidator(categoryRepo);
    castMembersIdsValidator = new CastMembersIdExistsInDatabaseValidator(castMemberRepo);
    useCase = new CreateVideoUseCase(uow, videoRepo, categoriesIdsValidator, genresIdsValidator, castMembersIdsValidator);
  });

  it('should create a video', async () => {
    const categories = Category.fake().theCategories(2).build();
    await categoryRepo.bulkInsert(categories);
    const categoriesId = categories.map((c) => c.category_id.value);

    const genres = Genre.fake().theGenres(2).build();
    genres[0].syncCategoriesId([categories[0].category_id]);
    genres[1].syncCategoriesId([categories[1].category_id]);
    await genreRepo.bulkInsert(genres);
    const genresId = genres.map((c) => c.genre_id.value);

    const castMembers = CastMember.fake().theCastMembers(2).build();
    await castMemberRepo.bulkInsert(castMembers);
    const castMembersId = castMembers.map((c) => c.cast_member_id.value);

    const output = await useCase.execute({
      title: 'test video',
      description: 'test description',
      year_launched: 2021,
      duration: 90,
      rating: RatingValues.R10,
      is_opened: true,
      categories_id: categoriesId,
      genres_id: genresId,
      cast_members_id: castMembersId,
    });

    expect(output).toStrictEqual({ id: expect.any(String) });

    const video = await videoRepo.findById(new VideoId(output.id));
    expect(video!.toJSON()).toStrictEqual({
      video_id: expect.any(String),
      title: 'test video',
      description: 'test description',
      year_launched: 2021,
      duration: 90,
      rating: RatingValues.R10,
      is_opened: true,
      is_published: false,
      banner: null,
      thumbnail: null,
      thumbnail_half: null,
      trailer: null,
      video: null,
      categories_id: expect.arrayContaining(categoriesId),
      genres_id: expect.arrayContaining(genresId),
      cast_members_id: expect.arrayContaining(castMembersId),
      created_at: expect.any(Date),
    });
  });

  it('rollback transaction', async () => {
    const categories = Category.fake().theCategories(2).build();
    await categoryRepo.bulkInsert(categories);
    const categoriesId = categories.map((c) => c.category_id.value);

    const genres = Genre.fake().theGenres(2).build();
    genres[0].syncCategoriesId([categories[0].category_id]);
    genres[1].syncCategoriesId([categories[1].category_id]);
    await genreRepo.bulkInsert(genres);
    const genresId = genres.map((c) => c.genre_id.value);

    const castMembers = CastMember.fake().theCastMembers(2).build();
    await castMemberRepo.bulkInsert(castMembers);
    const castMembersId = castMembers.map((c) => c.cast_member_id.value);

    const video = Video.fake().aVideoWithoutMedias().build();
    video.title = 't'.repeat(256);

    jest.spyOn(Video, 'create').mockImplementationOnce(() => video);

    await expect(
      useCase.execute({
        title: 'test video',
        rating: RatingValues.R10,
        categories_id: categoriesId,
        genres_id: genresId,
        cast_members_id: castMembersId,
      } as any),
    ).rejects.toThrow(DatabaseError);

    const videos = await videoRepo.findAll();
    expect(videos.length).toEqual(0);
  });
});
