import { IStorageService } from '@household/shared/services/storage-service';
import { test as baseTest } from '@household/test/fixtures/logging.fixture';
import { importStorageService } from '@household/shared/dependencies/services/storage-service';

export const test = baseTest.extend<Pick<IStorageService, 'writeFile' | 'uploadFile' | 'checkFile'>>({
  writeFile: async ({ logServiceCall }, use) => {
    const writeFile: IStorageService['writeFile'] = async (fileName, data, folder) => {
      const result = await importStorageService.writeFile(fileName, data, folder);
      await logServiceCall('writeFile', {
        fileName,
        data,
        folder,
      }, result);
      return result;
    };

    await use(writeFile);
  },
  uploadFile: async ({ logServiceCall }, use) => {
    const uploadFile: IStorageService['uploadFile'] = async (fileName, data) => {
      const result = await importStorageService.uploadFile(fileName, data);
      await logServiceCall('uploadFile', {
        fileName,
        data,
      }, result);
      return result;
    };

    await use(uploadFile);
  },
  checkFile: async ({ logServiceCall }, use) => {
    const checkFile: IStorageService['checkFile'] = async (fileName) => {
      const result = await importStorageService.checkFile(fileName);
      await logServiceCall('checkFile', {
        fileName,
      }, result);
      return result;
    };

    await use(checkFile);
  },
});
