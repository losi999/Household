import { fileImporterServiceFactory } from '@household/api/functions/file-importer/file-importer.service';
import { default as handler } from '@household/api/functions/file-importer/file-importer.handler';
import { default as index } from '@household/api/handlers/index.handler';
import { storageService } from '@household/shared/dependencies/services/storage-service';
import { fileService } from '@household/shared/dependencies/services/file-service';
import { excelParserService } from '@household/shared/dependencies/services/excel-parser-service';
import { transactionDocumentConverter } from '@household/shared/dependencies/converters/transaction-document-converter';
import { transactionService } from '@household/shared/dependencies/services/transaction-service';
import { fileDocumentConverter } from '@household/shared/dependencies/converters/file-document-converter';

const fileImporterService = fileImporterServiceFactory(fileService, fileDocumentConverter, storageService, excelParserService, transactionDocumentConverter, transactionService);

export default index({
  handler: handler(fileImporterService),
  before: [],
  after: [],
});

