import { IListTransactionsByAccountService, listTransactionsByAccountServiceFactory } from '@household/api/functions/list-transactions-by-account/list-transactions-by-account.service';
import { createAccountId, createPaymentTransactionDocument, createPaymentTransactionResponse } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { ITransactionDocumentConverter } from '@household/shared/converters/transaction-document-converter';
import { ITransactionService } from '@household/shared/services/transaction-service';

describe('List transactions by account service', () => {
  let service: IListTransactionsByAccountService;
  let mockTransactionService: Mock<ITransactionService>;
  let mockTransactionDocumentConverter: Mock<ITransactionDocumentConverter>;

  beforeEach(() => {
    mockTransactionService = createMockService('listTransactionsByAccountId');
    mockTransactionDocumentConverter = createMockService('toResponseList');

    service = listTransactionsByAccountServiceFactory(mockTransactionService.service, mockTransactionDocumentConverter.service);
  });

  const accountId = createAccountId();
  const pageSize = 25;
  const pageNumber = 1;
  const queriedDocument = createPaymentTransactionDocument();
  const convertedResponse = createPaymentTransactionResponse();

  it('should return documents', async () => {
    mockTransactionService.functions.listTransactionsByAccountId.mockResolvedValue([queriedDocument]);
    mockTransactionDocumentConverter.functions.toResponseList.mockReturnValue([convertedResponse]);

    const result = await service({
      accountId,
      pageSize,
      pageNumber,
    });
    expect(result).toEqual([convertedResponse]);
    validateFunctionCall(mockTransactionService.functions.listTransactionsByAccountId, {
      accountId,
      pageNumber,
      pageSize,
    });
    validateFunctionCall(mockTransactionDocumentConverter.functions.toResponseList, [queriedDocument], accountId);
    expect.assertions(3);
  });

  describe('should throw error', () => {
    it('if unable to query transactions', async () => {
      mockTransactionService.functions.listTransactionsByAccountId.mockRejectedValue('this is a mongo error');

      await service({
        accountId,
        pageSize,
        pageNumber,
      }).catch(validateError('Error while getting transactions', 500));
      validateFunctionCall(mockTransactionService.functions.listTransactionsByAccountId, {
        accountId,
        pageNumber,
        pageSize,
      });0;
      validateFunctionCall(mockTransactionDocumentConverter.functions.toResponseList);
      expect.assertions(4);
    });
  });
});
