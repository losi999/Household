import { IFileService } from '@household/shared/services/file-service';
import { IStorageService } from '@household/shared/services/storage-service';
import { File } from '@household/shared/types/types';
import { IExcelParserService } from '@household/shared/services/excel-parser-service';
import { ITransactionService } from '@household/shared/services/transaction-service';
import { IFileDocumentConverter } from '@household/shared/converters/file-document-converter';
import { httpErrors } from '@household/api/common/error-handlers';
import { IDraftTransactionDocumentConverter } from '@household/shared/converters/draft-transaction-document-converter';

export interface IBulkTransactionImporterService {
  (ctx: {
    bucketName: string;
    fileName: string;
  }): Promise<void>;
}

export const bulkTransactionImporterServiceFactory = (fileService: IFileService, fileDocumentConverter: IFileDocumentConverter, storageService: IStorageService, excelParser: IExcelParserService, draftTransactionDocumentConverter: IDraftTransactionDocumentConverter, transactionService: ITransactionService): IBulkTransactionImporterService =>
  async ({ bucketName, fileName }) => {
    const fileId = fileName.split('/').pop() as File.Id;

    const document = await fileService.getFileById(fileId).catch(httpErrors.file.getById({
      fileId,
    }));

    const file = await storageService.readFile(bucketName, fileName).catch(httpErrors.file.readFile({
      bucketName,
      fileName,
    }));

    const parsed = excelParser.parse(file, document.type, document.timezone);

    const drafts = parsed.map(p => draftTransactionDocumentConverter.create({
      body: p,
      file: document,
    }, null));

    await transactionService.saveTransactions(drafts).catch(httpErrors.transaction.saveMultiple(drafts));

    const update = fileDocumentConverter.updateStatus('completed');

    await fileService.updateFile(fileId, update).catch(httpErrors.file.update({
      fileId,
      update,
    }));
  };
