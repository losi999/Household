import type { S3 } from '@aws-sdk/client-s3';

export interface IStorageService {
  writeFile(bucket: string, fileName: string, data: object, folder: string): Promise<unknown>;
}

export const storageServiceFactory = (s3: S3): IStorageService => {
  const instance: IStorageService = {
    writeFile: async (bucket, fileName, data, folder) => {
      return s3.putObject({
        Bucket: bucket,
        Key: `${folder}/${fileName}`,
        Body: JSON.stringify(data),

      });
    },
  };

  return instance;
};
