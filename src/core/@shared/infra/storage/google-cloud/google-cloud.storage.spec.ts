import { Config } from '../../config';
import { GoogleCloudStorage } from './google-cloud.storage';

describe('GoogleCloudStorage Unit Tests', () => {
  let googleCloudStorage: GoogleCloudStorage;

  beforeEach(async () => {
    googleCloudStorage = new GoogleCloudStorage({
      get(envKey: string) {
        switch (envKey) {
          case 'GOOGLE_CLOUD_STORAGE_BUCKET_NAME':
            return Config.bucketName();
          case 'GOOGLE_CLOUD_CREDENTIALS':
            return Config.googleCredentials();
        }
        return '';
      },
    } as any);

    jest.spyOn(googleCloudStorage['storageSdk'], 'bucket').mockReturnValue({
      file: jest
        .fn()
        .mockReturnValue({ save: jest.fn().mockResolvedValue(undefined) }),
    } as any);
  });

  it('should store a file', async () => {
    const saveMock = jest.fn().mockResolvedValue(undefined);
    const fileMock = jest.fn().mockImplementation(() => ({ save: saveMock }));
    const storageSdk = googleCloudStorage['storageSdk'];
    jest
      .spyOn(storageSdk, 'bucket')
      .mockImplementation(() => ({ file: fileMock }) as any);

    await googleCloudStorage.store({
      data: Buffer.from('data'),
      id: 'location/1.txt',
      mime_type: 'text/plain',
    });

    expect(storageSdk.bucket).toHaveBeenCalledWith(Config.bucketName());
    expect(fileMock).toHaveBeenCalledWith('location/1.txt');
    expect(saveMock).toHaveBeenCalledWith(Buffer.from('data'), {
      metadata: {
        contentType: 'text/plain',
      },
    });
  });

  it('should get a file', async () => {
    const getMetadataMock = jest
      .fn()
      .mockResolvedValue([
        { contentType: 'text/plain', name: 'location/1.txt' },
      ]);

    // prettier-ignore
    const downloadMock = jest
      .fn()
      .mockResolvedValue([Buffer.from('data')]);

    // prettier-ignore
    const fileMock = jest
      .fn()
      .mockReturnValue({
        getMetadata: getMetadataMock,
        download: downloadMock,
      });

    // prettier-ignore
    jest
      .spyOn(googleCloudStorage['storageSdk'], 'bucket')
      .mockReturnValue({ file: fileMock } as any);

    await expect(
      googleCloudStorage.get('location/1.txt'),
    ).resolves.toStrictEqual({
      data: Buffer.from('data'),
      mime_type: 'text/plain',
    });
  });
});
