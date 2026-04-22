import { IStorageService, storageServiceFactory } from '@household/shared/services/storage-service';
import { s3, s3Client } from '@household/shared/dependencies/aws/s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Upload } from '@aws-sdk/lib-storage';
import { test as baseTest } from '@household/test/fixtures/logging.fixture';

const storageService = storageServiceFactory(s3, s3Client, getSignedUrl, Upload)(process.env.IMPORT_BUCKET);

export const test = baseTest.extend<Pick<IStorageService, 'writeFile' | 'uploadFile' | 'checkFile'>>({
  writeFile: async ({ logDbCall }, use) => {
    const writeFile: IStorageService['writeFile'] = async (fileName, data, folder) => {
      const result = await storageService.writeFile(fileName, data, folder);
      await logDbCall('writeFile', {
        fileName,
        data,
        folder,
      }, result);
      return result;
    };

    await use(writeFile);
  },
  uploadFile: async ({ logDbCall }, use) => {
    const uploadFile: IStorageService['uploadFile'] = async (fileName, data) => {
      const result = await storageService.uploadFile(fileName, data);
      await logDbCall('uploadFile', {
        fileName,
        data,
      }, result);
      return result;
    };

    await use(uploadFile);
  },
  checkFile: async ({ logDbCall }, use) => {
    const checkFile: IStorageService['checkFile'] = async (fileName) => {
      const result = await storageService.checkFile(fileName);
      await logDbCall('checkFile', {
        fileName,
      }, result);
      return result;
    };

    await use(checkFile);
  },
});
