import { httpErrors } from '@household/api/common/error-handlers';
import { getFileId } from '@household/shared/common/utils';
import { IFileDocumentConverter } from '@household/shared/converters/file-document-converter';
import { IFileService } from '@household/shared/services/file-service';
import { IStorageService } from '@household/shared/services/storage-service';
import { File } from '@household/shared/types/types';

export interface ICreateUploadUrlService {
  (ctx: {
    body: File.Request,
    expiresIn: number;
  }): Promise<File.Url & File.FileId>;
}

export const createUploadUrlServiceFactory = (fileService: IFileService, fileDocumentConverter: IFileDocumentConverter, storageService: IStorageService): ICreateUploadUrlService =>
  async ({ body, expiresIn }) => {
    const document = fileDocumentConverter.create(body, expiresIn);

    const saved = await fileService.saveFile(document).catch(httpErrors.file.save(document));

    const fileId = getFileId(saved);
    const url = await storageService.getSignedUrlForUpload(fileId, !!expiresIn).catch(httpErrors.file.getUploadUrl({
      fileType: document.fileType,
      fileId,
    }));

    return {
      url,
      fileId,
    };
  };
