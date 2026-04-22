import { IFileService } from '@household/shared/services/file-service';
import { fileServiceFactory } from '@household/shared/services/file-service';
import { mongoDbService } from '@household/test/dependencies';
import { test as baseTest } from '@household/test/fixtures/logging.fixture';

const fileService = fileServiceFactory(mongoDbService);

export const test = baseTest.extend<Pick<IFileService, 'saveFile' | 'findFileById'>>({
  saveFile: async ({ logDbCall }, use) => {
    const saveFile: IFileService['saveFile'] = async (file) => {
      const result = await fileService.saveFile(file);
      await logDbCall('saveFile', {
        file,
      }, result);
      return result;
    };

    await use(saveFile);
  },
  findFileById: async ({ logDbCall }, use) => {
    const findFileById: IFileService['findFileById'] = async (fileId) => {
      const result = await fileService.findFileById(fileId);
      await logDbCall('findFileById', {
        fileId,
      }, result);
      return result;
    };

    await use(findFileById);
  },
});
