import { Module } from '@nestjs/common';
import { CategoriesModule } from './nest-modules/categories-module/categories.module';
import { ConfigModule } from './nest-modules/config-module/config.module';
import { DatabaseModule } from './nest-modules/database-module/database.module';
import { SharedModule } from './nest-modules/shared-module/shared.module';
import { CastMembersModule } from './nest-modules/cast-members-module/cast-members.module';
import { GenresModule } from './nest-modules/genres-module/genres.module';
import { VideosModule } from './nest-modules/videos-module/videos.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    CategoriesModule,
    CastMembersModule,
    GenresModule,
    SharedModule,
    VideosModule,
  ],
})
export class AppModule {}
