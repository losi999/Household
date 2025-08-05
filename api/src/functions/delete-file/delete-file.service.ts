import { httpErrors } from '@household/api/common/error-handlers';
import { IFileService } from '@household/shared/services/file-service';
import { IStorageService } from '@household/shared/services/storage-service';
import { File } from '@household/shared/types/types';

export interface IDeleteFileService {
  (ctx: {
    fileId: File.Id;
  }): Promise<unknown>;
}

export const deleteFileServiceFactory = (
  fileService: IFileService, storageService: IStorageService): IDeleteFileService => {
  return async ({ fileId }) => {
    await fileService.deleteFile(fileId).catch(httpErrors.file.delete({
      fileId,
    }));

    return storageService.deleteFile(fileId).catch(httpErrors.file.deleteFile({
      fileId,
    }));
  };
};
