import { Test } from '@nestjs/testing';
import { GoogleCloudStorage } from './google-cloud.storage';
import { ConfigModule } from 'src/nest-modules/config-module/config.module';
import { ConfigService } from '@nestjs/config';

describe('GoogleCloudStorage Integration Tests', () => {
  let googleCloudStorage: GoogleCloudStorage;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        {
          provide: GoogleCloudStorage,
          inject: [ConfigService],
          useFactory(configService: ConfigService) {
            return new GoogleCloudStorage(configService);
          },
        },
      ],
    }).compile();
    googleCloudStorage = module.get(GoogleCloudStorage);
  });

  it('should store a file', async () => {
    await googleCloudStorage.store({
      data: Buffer.from('data'),
      id: 'location/1.txt',
      mime_type: 'text/plain',
    });

    await expect(
      googleCloudStorage.get('location/1.txt'),
    ).resolves.toStrictEqual({
      data: Buffer.from('data'),
      mime_type: 'text/plain',
    });
  });
});
