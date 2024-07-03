import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { DynamicModule } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import EventEmitter2 from 'eventemitter2';
import { DatabaseModule } from 'src/nest-modules/database-module/database.module';
import { EventModule } from 'src/nest-modules/event-module/event.module';
import { SharedModule } from 'src/nest-modules/shared-module/shared.module';
import { VideosModule } from '../videos.module';
import { UnitOfWorkInMemory } from '@core/@shared/infra/db/in-memory/in-memory-unit-of-work';
import { VideoAudioMediaReplacedIntegrationEvent } from '@core/video/domain/events/video-audio-media-replaced.event';
import { ConfigModule } from 'src/nest-modules/config-module/config.module';

class RabbitmqModuleFake {
  static forRoot(): DynamicModule {
    return {
      module: RabbitmqModuleFake,
      global: true,
      providers: [
        {
          provide: AmqpConnection,
          useValue: {
            publish: jest.fn(),
          },
        },
      ],
      exports: [AmqpConnection],
    };
  }
}

describe('VideosModule Unit Tests', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        SharedModule,
        EventModule,
        DatabaseModule,
        RabbitmqModuleFake.forRoot(),
        VideosModule,
      ],
    })
      .overrideProvider('UnitOfWork')
      .useClass(UnitOfWorkInMemory)
      .compile();
    await module.init();
  });

  afterEach(async () => {
    await module?.close();
  });

  it('should register handlers', async () => {
    const eventemitter2 = module.get<EventEmitter2>(EventEmitter2);
    expect(
      eventemitter2.listeners(VideoAudioMediaReplacedIntegrationEvent.name),
    ).toHaveLength(1);
  });
});
