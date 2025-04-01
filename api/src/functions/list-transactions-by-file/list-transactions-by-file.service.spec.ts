import { IListTransactionsByFileService, listTransactionsByFileServiceFactory } from '@household/api/functions/list-transactions-by-file/list-transactions-by-file.service';
import { createDraftTransactionDocument, createDraftTransactionResponse, createFileId } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { ITransactionDocumentConverter } from '@household/shared/converters/transaction-document-converter';
import { ITransactionService } from '@household/shared/services/transaction-service';

describe('List transactions by file service', () => {
  let service: IListTransactionsByFileService;
  let mockTransactionService: Mock<ITransactionService>;
  let mockTransactionDocumentConverter: Mock<ITransactionDocumentConverter>;

  beforeEach(() => {
    mockTransactionService = createMockService('listDraftTransactionsByFileId');
    mockTransactionDocumentConverter = createMockService('toResponseList');

    service = listTransactionsByFileServiceFactory(mockTransactionService.service, mockTransactionDocumentConverter.service);
  });

  const fileId = createFileId();
  const queriedDocument = createDraftTransactionDocument();
  const convertedResponse = createDraftTransactionResponse();

  it('should return documents', async () => {
    mockTransactionService.functions.listDraftTransactionsByFileId.mockResolvedValue([queriedDocument]);
    mockTransactionDocumentConverter.functions.toResponseList.mockReturnValue([convertedResponse]);

    const result = await service({
      fileId,
    });
    expect(result).toEqual([convertedResponse]);
    validateFunctionCall(mockTransactionService.functions.listDraftTransactionsByFileId, fileId);
    validateFunctionCall(mockTransactionDocumentConverter.functions.toResponseList, [queriedDocument]);
    expect.assertions(3);
  });

  describe('should throw error', () => {
    it('if unable to query transactions', async () => {
      mockTransactionService.functions.listDraftTransactionsByFileId.mockRejectedValue('this is a mongo error');

      await service({
        fileId,
      }).catch(validateError('Error while getting transactions', 500));
      validateFunctionCall(mockTransactionService.functions.listDraftTransactionsByFileId, fileId);
      validateFunctionCall(mockTransactionDocumentConverter.functions.toResponseList);
      expect.assertions(4);
    });
  });
});
