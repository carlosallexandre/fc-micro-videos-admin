import { SequelizeOptions } from 'sequelize-typescript';
import { setupSequelize } from '@core/@shared/infra/testing/helpers';
import { CastMemberModel } from '@core/cast-member/infra/db/sequelize/cast-member.model';
import { CategoryModel } from '@core/category/infra/db/sequelize/category.model';
import { GenreCategoryModel } from '@core/genre/infra/db/sequelize/genre-category.model';
import { GenreModel } from '@core/genre/infra/db/sequelize/genre.model';
import { AudioVideoMediaModel } from '../audio-video-media.model';
import { ImageMediaModel } from '../image-media.model';
import {
  VideoModel,
  VideoCategoryModel,
  VideoGenreModel,
  VideoCastMemberModel,
} from '../video.model';

export function setupSequelizeForVideo(options: SequelizeOptions = {}) {
  return setupSequelize({
    models: [
      ImageMediaModel,
      VideoModel,
      AudioVideoMediaModel,
      VideoCategoryModel,
      CategoryModel,
      VideoGenreModel,
      GenreModel,
      GenreCategoryModel,
      VideoCastMemberModel,
      CastMemberModel,
    ],
    ...options,
  });
}
