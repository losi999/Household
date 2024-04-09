import { nulkTransactionImporterServiceFactory } from '@household/api/functions/bulk-transaction-importer/bulk-transaction-importer.service';
import { default as handler } from '@household/api/functions/bulk-transaction-importer/bulk-transaction-importer.handler';
import { default as index } from '@household/api/handlers/index.handler';
import { storageService } from '@household/shared/dependencies/services/storage-service';
import { fileService } from '@household/shared/dependencies/services/file-service';
import { excelParserService } from '@household/shared/dependencies/services/excel-parser-service';
import { transactionDocumentConverter } from '@household/shared/dependencies/converters/transaction-document-converter';
import { transactionService } from '@household/shared/dependencies/services/transaction-service';
import { fileDocumentConverter } from '@household/shared/dependencies/converters/file-document-converter';

const bulkTransactionImporterService = nulkTransactionImporterServiceFactory(fileService, fileDocumentConverter, storageService, excelParserService, transactionDocumentConverter, transactionService);

export default index({
  handler: handler(bulkTransactionImporterService),
  before: [],
  after: [],
});

