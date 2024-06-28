import { Global, Module, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SequelizeModule, getConnectionToken } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize';
import { CONFIG_SCHEMA_TYPE } from 'src/nest-modules/config-module/config.module';
import { UnitOfWorkSequelize } from '@core/@shared/infra/db/sequelize/unit-of-work-sequelize';
import { CategoryModel } from '@core/category/infra/db/sequelize/category.model';
import { GenreModel } from '@core/genre/infra/db/sequelize/genre.model';
import { GenreCategoryModel } from '@core/genre/infra/db/sequelize/genre-category.model';
import { CastMemberModel } from '@core/cast-member/infra/db/sequelize/cast-member.model';
import {
  VideoCastMemberModel,
  VideoCategoryModel,
  VideoGenreModel,
  VideoModel,
} from '@core/video/infra/db/sequelize/video.model';
import { ImageMediaModel } from '@core/video/infra/db/sequelize/image-media.model';
import { AudioVideoMediaModel } from '@core/video/infra/db/sequelize/audio-video-media.model';

const models = [
  CategoryModel,
  GenreModel,
  GenreCategoryModel,
  CastMemberModel,
  VideoModel,
  VideoCategoryModel,
  VideoCastMemberModel,
  VideoGenreModel,
  ImageMediaModel,
  AudioVideoMediaModel,
];

@Global()
@Module({
  imports: [
    SequelizeModule.forRootAsync({
      inject: [ConfigService],
      async useFactory(configService: ConfigService<CONFIG_SCHEMA_TYPE>) {
        const dbVendor = configService.get('DB_VENDOR');

        switch (dbVendor) {
          case 'sqlite':
            return {
              models,
              dialect: 'sqlite',
              host: configService.get('DB_HOST'),
              logging: configService.get('DB_LOGGING'),
              autoLoadModels: configService.get('DB_AUTO_LOAD_MODELS'),
            };
          case 'mysql':
            return {
              models,
              dialect: 'mysql',
              host: configService.get('DB_HOST'),
              port: configService.get('DB_PORT'),
              database: configService.get('DB_DATABASE'),
              username: configService.get('DB_USERNAME'),
              password: configService.get('DB_PASSWORD'),
              logging: configService.get('DB_LOGGING'),
              autoLoadModels: configService.get('DB_AUTO_LOAD_MODELS'),
            };
          default:
            throw new Error(`Unsupported database configuration: ${dbVendor}`);
        }
      },
    }),
  ],
  providers: [
    {
      provide: UnitOfWorkSequelize,
      scope: Scope.REQUEST,
      inject: [getConnectionToken()],
      useFactory(sequelize: Sequelize) {
        return new UnitOfWorkSequelize(sequelize);
      },
    },
    {
      provide: 'UnitOfWork',
      useExisting: UnitOfWorkSequelize,
    },
  ],
  exports: ['UnitOfWork'],
})
export class DatabaseModule {}
