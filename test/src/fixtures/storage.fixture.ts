import { IStorageService } from '@household/shared/services/storage-service';
import { test as baseTest } from '@household/test/fixtures/logging.fixture';
import { importStorageService } from '@household/shared/dependencies/services/storage-service';

export const test = baseTest.extend<Pick<IStorageService, 'writeFile' | 'uploadFile' | 'checkFile'>>({
  writeFile: async ({ logDbCall }, use) => {
    const writeFile: IStorageService['writeFile'] = async (fileName, data, folder) => {
      const result = await importStorageService.writeFile(fileName, data, folder);
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
      const result = await importStorageService.uploadFile(fileName, data);
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
      const result = await importStorageService.checkFile(fileName);
      await logDbCall('checkFile', {
        fileName,
      }, result);
      return result;
    };

    await use(checkFile);
  },
});
