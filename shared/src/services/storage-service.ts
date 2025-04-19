import { PutObjectCommand, type S3, type S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { FILE_UPLOAD_LINK_EXPIRATION } from '@household/shared/constants';

export interface IStorageService {
  getSignedUrlForUpload(fileName: string): Promise<string>;
  writeFile(bucket: string, fileName: string, data: object, folder: string): Promise<unknown>;
  readFile(bucket: string, fileName: string): Promise<Uint8Array>;
  deleteFile(fileName: string): Promise<unknown>;
}

export const storageServiceFactory = (s3: S3, s3Client: S3Client, s3RequestPresigner: typeof getSignedUrl): IStorageService => {
  const instance: IStorageService = {
    getSignedUrlForUpload: async (fileName) => {

      return s3RequestPresigner(s3Client, new PutObjectCommand({
        Bucket: process.env.IMPORT_BUCKET,
        Key: fileName,
      }), {
        expiresIn: FILE_UPLOAD_LINK_EXPIRATION,
      });
    },
    writeFile: async (bucket, fileName, data, folder) => {
      return s3.putObject({
        Bucket: bucket,
        Key: `${folder}/${fileName}`,
        Body: JSON.stringify(data),

      });
    },
    readFile: async (bucket, fileName) => {
      const resp = await s3.getObject({
        Bucket: bucket,
        Key: fileName,
      });
      return resp.Body.transformToByteArray();
    },
    deleteFile: (fileName) => {
      return s3.deleteObject({
        Bucket: process.env.IMPORT_BUCKET,
        Key: `${fileName}`,
      });
    },
  };

  return instance;
};
