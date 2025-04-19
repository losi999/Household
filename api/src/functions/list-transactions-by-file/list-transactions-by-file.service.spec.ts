import { IListTransactionsByFileService, listTransactionsByFileServiceFactory } from '@household/api/functions/list-transactions-by-file/list-transactions-by-file.service';
import { createDraftTransactionDocument, createDraftTransactionResponse, createFileId } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { IDraftTransactionDocumentConverter } from '@household/shared/converters/draft-transaction-document-converter';
import { ITransactionService } from '@household/shared/services/transaction-service';

describe('List transactions by file service', () => {
  let service: IListTransactionsByFileService;
  let mockTransactionService: Mock<ITransactionService>;
  let mockDraftTransactionDocumentConverter: Mock<IDraftTransactionDocumentConverter>;

  beforeEach(() => {
    mockTransactionService = createMockService('listDraftTransactionsByFileId');
    mockDraftTransactionDocumentConverter = createMockService('toResponseList');

    service = listTransactionsByFileServiceFactory(mockTransactionService.service, mockDraftTransactionDocumentConverter.service);
  });

  const fileId = createFileId();
  const queriedDocument = createDraftTransactionDocument();
  const convertedResponse = createDraftTransactionResponse();

  it('should return documents', async () => {
    mockTransactionService.functions.listDraftTransactionsByFileId.mockResolvedValue([queriedDocument]);
    mockDraftTransactionDocumentConverter.functions.toResponseList.mockReturnValue([convertedResponse]);

    const result = await service({
      fileId,
    });
    expect(result).toEqual([convertedResponse]);
    validateFunctionCall(mockTransactionService.functions.listDraftTransactionsByFileId, fileId);
    validateFunctionCall(mockDraftTransactionDocumentConverter.functions.toResponseList, [queriedDocument]);
    expect.assertions(3);
  });

  describe('should throw error', () => {
    it('if unable to query transactions', async () => {
      mockTransactionService.functions.listDraftTransactionsByFileId.mockRejectedValue('this is a mongo error');

      await service({
        fileId,
      }).catch(validateError('Error while getting transactions', 500));
      validateFunctionCall(mockTransactionService.functions.listDraftTransactionsByFileId, fileId);
      validateFunctionCall(mockDraftTransactionDocumentConverter.functions.toResponseList);
      expect.assertions(4);
    });
  });
});
