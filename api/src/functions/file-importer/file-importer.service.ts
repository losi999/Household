import { IFileService } from '@household/shared/services/file-service';
import { IStorageService } from '@household/shared/services/storage-service';
import { File } from '@household/shared/types/types';
import { IExcelParserService } from '@household/shared/services/excel-parser-service';
import { ITransactionDocumentConverter } from '@household/shared/converters/transaction-document-converter';
import { ITransactionService } from '@household/shared/services/transaction-service';
import { IFileDocumentConverter } from '@household/shared/converters/file-document-converter';

export interface IFileImporterService {
  (ctx: {
    bucketName: string;
    fileName: string;
  }): Promise<void>;
}

export const fileImporterServiceFactory = (fileService: IFileService, fileDocumentConverter: IFileDocumentConverter, storageService: IStorageService, excelParser: IExcelParserService, transactionDocumentConverter: ITransactionDocumentConverter, transactionService: ITransactionService): IFileImporterService =>
  async ({ bucketName, fileName }) => {
    const fileId = fileName.split('/').pop() as File.Id;
    console.log('A');
    const document = await fileService.getFileById(fileId);
    console.log('B');

    const file = await storageService.readFile(bucketName, fileName);
    console.log('C');

    const parsed = excelParser.parse(file, document.type, document.timezone);

    console.log('D');

    console.log(parsed);

    const drafts = parsed.map(p => transactionDocumentConverter.createDraftDocument({
      body: p,
      file: document,
    }, null));

    await transactionService.saveTransactions(drafts);

    const update = fileDocumentConverter.updateStatus('completed');

    await fileService.updateFile(fileId, update);
  };
