import { IFileService } from '@household/shared/services/file-service';
import { IStorageService } from '@household/shared/services/storage-service';
import { File } from '@household/shared/types/types';
import { IExcelParserService } from '@household/shared/services/excel-parser-service';
import { ITransactionService } from '@household/shared/services/transaction-service';
import { IFileDocumentConverter } from '@household/shared/converters/file-document-converter';
import { httpErrors } from '@household/api/common/error-handlers';
import { IDraftTransactionDocumentConverter } from '@household/shared/converters/draft-transaction-document-converter';
import { FileProcessingStatus } from '@household/shared/enums';

export interface IBulkTransactionImporterService {
  (ctx: {
    bucketName: string;
    fileId: File.Id;
  }): Promise<void>;
}

export const bulkTransactionImporterServiceFactory = (fileService: IFileService, fileDocumentConverter: IFileDocumentConverter, storageService: (bucketName: string) => IStorageService, excelParser: IExcelParserService, draftTransactionDocumentConverter: IDraftTransactionDocumentConverter, transactionService: ITransactionService): IBulkTransactionImporterService =>
  async ({ fileId, bucketName }) => {
    const document = await fileService.findFileById(fileId).catch(httpErrors.file.getById({
      fileId,
    }));

    const file = await storageService(bucketName).readFile(fileId)
      .catch(httpErrors.file.readFile({
        fileId,
      }));

    const parsed = excelParser.parse({
      fileContent: file,
      fileType: document.fileType,
      timezone: document.timezone,
    });

    const drafts = parsed.map(p => draftTransactionDocumentConverter.create({
      body: p,
      file: document,
    }, document.expiresAt ? (document.expiresAt?.getTime() - Date.now()) / 1000 : null));

    await transactionService.saveTransactions(drafts).catch(httpErrors.transaction.saveMultiple(drafts));

    const update = fileDocumentConverter.updateStatus(FileProcessingStatus.Completed);

    await fileService.updateFile(fileId, update).catch(httpErrors.file.update({
      fileId,
      update,
    }));
  };
