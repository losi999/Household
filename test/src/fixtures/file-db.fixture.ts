import { fileService } from '@household/shared/dependencies/services/file-service';
import { IFileService } from '@household/shared/services/file-service';
import { test as baseTest } from '@household/test/fixtures/logging.fixture';

export const test = baseTest.extend<Pick<IFileService, 'saveFile' | 'findFileById'>>({
  saveFile: async ({ logServiceCall }, use) => {
    const saveFile: IFileService['saveFile'] = async (file) => {
      const result = await fileService.saveFile(file);
      await logServiceCall('saveFile', {
        file,
      }, result);
      return result;
    };

    await use(saveFile);
  },
  findFileById: async ({ logServiceCall }, use) => {
    const findFileById: IFileService['findFileById'] = async (fileId) => {
      const result = await fileService.findFileById(fileId);
      await logServiceCall('findFileById', {
        fileId,
      }, result);
      return result;
    };

    await use(findFileById);
  },
});
