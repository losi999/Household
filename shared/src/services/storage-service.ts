import { PutObjectCommand, type S3, type S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { FILE_UPLOAD_LINK_EXPIRATION } from '@household/shared/constants';
import { Upload } from '@aws-sdk/lib-storage';

export interface IStorageService {
  getSignedUrlForUpload(fileName: string, isTestFile: boolean): Promise<string>;
  writeFile(fileName: string, data: any, folder: string): Promise<unknown>;
  checkFile(fileName: string): Promise<unknown>;
  readFile(fileName: string): Promise<Uint8Array>;
  deleteFile(fileName: string): Promise<unknown>;
  uploadFile(fileName: string, content: any): Promise<unknown>;
}

export const storageServiceFactory = (s3: S3, s3Client: S3Client, s3RequestPresigner: typeof getSignedUrl, upload: typeof Upload) => (bucketName: string): IStorageService => {
  const instance: IStorageService = {
    uploadFile: (fileName, data) => {
      return new upload({
        client: s3Client,
        params: {
          Tagging: 'Test=true',
          Bucket: bucketName,
          Key: fileName,
          Body: Buffer.from(data),
          ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      }).done();
    },
    getSignedUrlForUpload: async (fileName, isTestFile) => {

      return s3RequestPresigner(s3Client, new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        Tagging: isTestFile ? 'Test=true' : undefined,
      }), {
        expiresIn: FILE_UPLOAD_LINK_EXPIRATION,
      });
    },
    writeFile: async (fileName, data, folder) => {
      return s3.putObject({
        Bucket: bucketName,
        Key: [
          folder,
          fileName,
        ].filter(p => !!p).join('/'),
        Body: data,
      });
    },
    checkFile: async (fileName) => {
      return s3.headObject({
        Bucket: bucketName,
        Key: fileName,
      }).catch((error) => {
        if (error.name !== 'NotFound') {
          throw error;
        }
      });
    },
    readFile: async (fileName) => {
      const resp = await s3.getObject({
        Bucket: bucketName,
        Key: fileName,

      });
      return resp.Body.transformToByteArray();
    },
    deleteFile: (fileName) => {
      return s3.deleteObject({
        Bucket: bucketName,
        Key: `${fileName}`,
      });
    },
  };

  return instance;
};
