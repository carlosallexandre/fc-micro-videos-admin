import { Module } from '@nestjs/common';
import { CategoriesModule } from './nest-modules/categories-module/categories.module';
import { ConfigModule } from './nest-modules/config-module/config.module';
import { DatabaseModule } from './nest-modules/database-module/database.module';
import { SharedModule } from './nest-modules/shared-module/shared.module';
import { CastMembersModule } from './nest-modules/cast-members-module/cast-members.module';
import { GenresModule } from './nest-modules/genres-module/genres.module';
import { VideosModule } from './nest-modules/videos-module/videos.module';
import { EventModule } from './nest-modules/event-module/event.module';
import { RabbitmqModule } from './nest-modules/rabbitmq-module/rabbitmq.module';
import { AuthModule } from './nest-modules/auth-module/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    RabbitmqModule.forRoot(),
    DatabaseModule,
    EventModule,
    SharedModule,
    AuthModule,
    CategoriesModule,
    CastMembersModule,
    GenresModule,
    VideosModule,
  ],
})
export class AppModule {}
