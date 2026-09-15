import { httpErrors } from '@household/api/common/error-handlers';
import { IFileDocumentConverter } from '@household/shared/converters/file-document-converter';
import { IFileService } from '@household/shared/services/file-service';
import { Responses } from '@household/shared/types/responses';

export interface IListFilesService {
  (): Promise<Responses.File[]>;
}

export const listFilesServiceFactory = (
  fileService: IFileService,
  fileDocumentConverter: IFileDocumentConverter): IListFilesService => {
  return async () => {

    const documents = await fileService.listFiles().catch(httpErrors.file.list());

    return fileDocumentConverter.toResponseList(documents);
  };
};
