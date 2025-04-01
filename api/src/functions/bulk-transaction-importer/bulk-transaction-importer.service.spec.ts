import { IBulkTransactionImporterService, bulkTransactionImporterServiceFactory } from '@household/api/functions/bulk-transaction-importer/bulk-transaction-importer.service';
import { createDocumentUpdate, createDraftTransactionDocument, createFileDocument, createFileId } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { IDraftTransactionDocumentConverter } from '@household/shared/converters/draft-transaction-document-converter';
import { IFileDocumentConverter } from '@household/shared/converters/file-document-converter';
import { IExcelParserService } from '@household/shared/services/excel-parser-service';
import { IFileService } from '@household/shared/services/file-service';
import { IStorageService } from '@household/shared/services/storage-service';
import { ITransactionService } from '@household/shared/services/transaction-service';

describe('Bulk transaction importer service', () => {
  let service: IBulkTransactionImporterService;
  let mockFileService: Mock<IFileService>;
  let mockFileDocumentConverter: Mock<IFileDocumentConverter>;
  let mockStorageService: Mock<IStorageService>;
  let mockExcelParser: Mock<IExcelParserService>;
  let mockDraftTransactionDocumentConverter: Mock<IDraftTransactionDocumentConverter>;
  let mockTransactionService: Mock<ITransactionService>;

  beforeEach(() => {
    mockFileService = createMockService('getFileById', 'updateFile');
    mockFileDocumentConverter = createMockService('updateStatus');
    mockStorageService = createMockService('readFile');
    mockExcelParser = createMockService('parse');
    mockDraftTransactionDocumentConverter = createMockService('create');
    mockTransactionService = createMockService('saveTransactions');

    service = bulkTransactionImporterServiceFactory(mockFileService.service,
      mockFileDocumentConverter.service,
      mockStorageService.service,
      mockExcelParser.service,
      mockDraftTransactionDocumentConverter.service,
      mockTransactionService.service);
  });

  const bucketName = 'file-importer-bucket';
  const fileId = createFileId();
  const queriedFileDocument = createFileDocument();
  const fileContent = new Uint8Array();
  const amount = 100;
  const description = 'description';
  const issuedAt = new Date();
  const draftTransaction = createDraftTransactionDocument();
  const fileDocumentUpdate = createDocumentUpdate();

  describe('should return', () => {
    it('if file is processed', async () => {
      mockFileService.functions.getFileById.mockResolvedValue(queriedFileDocument);
      mockStorageService.functions.readFile.mockResolvedValue(fileContent);
      mockExcelParser.functions.parse.mockReturnValue([
        {
          amount,
          description,
          issuedAt,
        },
      ]);
      mockDraftTransactionDocumentConverter.functions.create.mockReturnValue(draftTransaction);
      mockTransactionService.functions.saveTransactions.mockResolvedValue(undefined);
      mockFileDocumentConverter.functions.updateStatus.mockReturnValue(fileDocumentUpdate);
      mockFileService.functions.updateFile.mockResolvedValue(undefined);

      await service({
        bucketName,
        fileId,
      });
      validateFunctionCall(mockFileService.functions.getFileById, fileId);
      validateFunctionCall(mockStorageService.functions.readFile, bucketName, fileId);
      validateFunctionCall(mockExcelParser.functions.parse, fileContent, queriedFileDocument.fileType, queriedFileDocument.timezone);
      validateFunctionCall(mockDraftTransactionDocumentConverter.functions.create, {
        body: {
          amount,
          description,
          issuedAt,
        },
        file: queriedFileDocument,
      }, null);
      validateFunctionCall(mockTransactionService.functions.saveTransactions, [draftTransaction]);
      validateFunctionCall(mockFileDocumentConverter.functions.updateStatus, 'completed');
      validateFunctionCall(mockFileService.functions.updateFile, fileId, fileDocumentUpdate);
      expect.assertions(7);
    });

  });

  describe('should throw error', () => {
    it('if unable to get file document', async () => {
      mockFileService.functions.getFileById.mockRejectedValue('this is a mongo error');

      await service({
        bucketName,
        fileId,
      }).catch(validateError('Error while getting file document', 500));
      validateFunctionCall(mockFileService.functions.getFileById, fileId);
      validateFunctionCall(mockStorageService.functions.readFile);
      validateFunctionCall(mockExcelParser.functions.parse);
      validateFunctionCall(mockDraftTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.saveTransactions);
      validateFunctionCall(mockFileDocumentConverter.functions.updateStatus);
      validateFunctionCall(mockFileService.functions.updateFile);
      expect.assertions(9);
    });

    it('if unable to read file', async () => {
      mockFileService.functions.getFileById.mockResolvedValue(queriedFileDocument);
      mockStorageService.functions.readFile.mockRejectedValue('this is an s3 error');

      await service({
        bucketName,
        fileId,
      }).catch(validateError('Error while reading file', 500));
      validateFunctionCall(mockFileService.functions.getFileById, fileId);
      validateFunctionCall(mockStorageService.functions.readFile, bucketName, fileId);
      validateFunctionCall(mockExcelParser.functions.parse);
      validateFunctionCall(mockDraftTransactionDocumentConverter.functions.create);
      validateFunctionCall(mockTransactionService.functions.saveTransactions);
      validateFunctionCall(mockFileDocumentConverter.functions.updateStatus);
      validateFunctionCall(mockFileService.functions.updateFile);
      expect.assertions(9);
    });

    it('if unable to save transactions', async () => {
      mockFileService.functions.getFileById.mockResolvedValue(queriedFileDocument);
      mockStorageService.functions.readFile.mockResolvedValue(fileContent);
      mockExcelParser.functions.parse.mockReturnValue([
        {
          amount,
          description,
          issuedAt,
        },
      ]);
      mockDraftTransactionDocumentConverter.functions.create.mockReturnValue(draftTransaction);
      mockTransactionService.functions.saveTransactions.mockRejectedValue('this is a mongo error');

      await service({
        bucketName,
        fileId,
      }).catch(validateError('Error while saving transactions', 500));
      validateFunctionCall(mockFileService.functions.getFileById, fileId);
      validateFunctionCall(mockStorageService.functions.readFile, bucketName, fileId);
      validateFunctionCall(mockExcelParser.functions.parse, fileContent, queriedFileDocument.fileType, queriedFileDocument.timezone);
      validateFunctionCall(mockDraftTransactionDocumentConverter.functions.create, {
        body: {
          amount,
          description,
          issuedAt,
        },
        file: queriedFileDocument,
      }, null);
      validateFunctionCall(mockTransactionService.functions.saveTransactions, [draftTransaction]);
      validateFunctionCall(mockFileDocumentConverter.functions.updateStatus);
      validateFunctionCall(mockFileService.functions.updateFile);
      expect.assertions(9);
    });

    it('if unable to update file', async () => {
      mockFileService.functions.getFileById.mockResolvedValue(queriedFileDocument);
      mockStorageService.functions.readFile.mockResolvedValue(fileContent);
      mockExcelParser.functions.parse.mockReturnValue([
        {
          amount,
          description,
          issuedAt,
        },
      ]);
      mockDraftTransactionDocumentConverter.functions.create.mockReturnValue(draftTransaction);
      mockTransactionService.functions.saveTransactions.mockResolvedValue(undefined);
      mockFileDocumentConverter.functions.updateStatus.mockReturnValue(fileDocumentUpdate);
      mockFileService.functions.updateFile.mockRejectedValue('this is a mongo error');

      await service({
        bucketName,
        fileId,
      }).catch(validateError('Error while updating file document', 500));
      validateFunctionCall(mockFileService.functions.getFileById, fileId);
      validateFunctionCall(mockStorageService.functions.readFile, bucketName, fileId);
      validateFunctionCall(mockExcelParser.functions.parse, fileContent, queriedFileDocument.fileType, queriedFileDocument.timezone);
      validateFunctionCall(mockDraftTransactionDocumentConverter.functions.create, {
        body: {
          amount,
          description,
          issuedAt,
        },
        file: queriedFileDocument,
      }, null);
      validateFunctionCall(mockTransactionService.functions.saveTransactions, [draftTransaction]);
      validateFunctionCall(mockFileDocumentConverter.functions.updateStatus, 'completed');
      validateFunctionCall(mockFileService.functions.updateFile, fileId, fileDocumentUpdate);
      expect.assertions(9);
    });
  });
});
