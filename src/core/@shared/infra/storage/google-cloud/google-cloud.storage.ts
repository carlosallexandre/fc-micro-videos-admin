import { IStorage } from '@core/@shared/application/storage.interface';
import { Storage as GoogleCloudStorageSdk } from '@google-cloud/storage';
import { ConfigService } from '@nestjs/config';
import { CONFIG_SCHEMA_TYPE } from 'src/nest-modules/config-module/config.module';

export class GoogleCloudStorage implements IStorage {
  private bucketName: string;
  private storageSdk: GoogleCloudStorageSdk;

  constructor(configService: ConfigService<CONFIG_SCHEMA_TYPE>) {
    this.bucketName = configService.get('GOOGLE_CLOUD_STORAGE_BUCKET_NAME');
    this.storageSdk = new GoogleCloudStorageSdk({
      credentials: JSON.parse(configService.get('GOOGLE_CLOUD_CREDENTIALS')),
    });
  }

  store(object: {
    data: Buffer;
    mime_type?: string;
    id: string;
  }): Promise<void> {
    return this.storageSdk
      .bucket(this.bucketName)
      .file(object.id)
      .save(object.data, { metadata: { contentType: object.mime_type } });
  }

  get(id: string): Promise<{ data: Buffer; mime_tpe?: string }> {
    const file = this.storageSdk.bucket(this.bucketName).file(id);
    return Promise.all([file.getMetadata(), file.download()]).then(
      ([metadata, content]) => ({
        data: content[0],
        mime_type: metadata[0].contentType,
      }),
    );
  }
}
