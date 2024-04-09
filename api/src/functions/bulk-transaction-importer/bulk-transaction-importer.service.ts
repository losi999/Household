import { IFileService } from '@household/shared/services/file-service';
import { IStorageService } from '@household/shared/services/storage-service';
import { File } from '@household/shared/types/types';
import { IExcelParserService } from '@household/shared/services/excel-parser-service';
import { ITransactionDocumentConverter } from '@household/shared/converters/transaction-document-converter';
import { ITransactionService } from '@household/shared/services/transaction-service';
import { IFileDocumentConverter } from '@household/shared/converters/file-document-converter';

export interface IBulkTransactionImporterService {
  (ctx: {
    bucketName: string;
    fileName: string;
  }): Promise<void>;
}

export const nulkTransactionImporterServiceFactory = (fileService: IFileService, fileDocumentConverter: IFileDocumentConverter, storageService: IStorageService, excelParser: IExcelParserService, transactionDocumentConverter: ITransactionDocumentConverter, transactionService: ITransactionService): IBulkTransactionImporterService =>
  async ({ bucketName, fileName }) => {
    const fileId = fileName.split('/').pop() as File.Id;

    const document = await fileService.getFileById(fileId);

    const file = await storageService.readFile(bucketName, fileName);

    const parsed = excelParser.parse(file, document.type, document.timezone);

    const drafts = parsed.map(p => transactionDocumentConverter.createDraftDocument({
      body: p,
      file: document,
    }, null));

    await transactionService.saveTransactions(drafts);

    const update = fileDocumentConverter.updateStatus('completed');

    await fileService.updateFile(fileId, update);
  };
