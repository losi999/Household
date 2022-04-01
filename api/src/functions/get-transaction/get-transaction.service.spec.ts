import { IGetTransactionService, getTransactionServiceFactory } from '@household/api/functions/get-transaction/get-transaction.service';
import { createAccountId, createPaymentTransactionDocument, createPaymentTransactionResponse, createTransactionId } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { ITransactionDocumentConverter } from '@household/shared/converters/transaction-document-converter';
import { ITransactionService } from '@household/shared/services/transaction-service';

describe('Get transaction service', () => {
  let service: IGetTransactionService;
  let mockTransactionService: Mock<ITransactionService>;
  let mockTransactionDocumentConverter: Mock<ITransactionDocumentConverter>;

  beforeEach(() => {
    mockTransactionService = createMockService('getTransactionByIdAndAccountId');
    mockTransactionDocumentConverter = createMockService('toResponse');

    service = getTransactionServiceFactory(mockTransactionService.service, mockTransactionDocumentConverter.service);
  });

  const transactionId = createTransactionId();
  const accountId = createAccountId();
  const queriedDocument = createPaymentTransactionDocument();
  const convertedResponse = createPaymentTransactionResponse();

  it('should return transaction', async () => {
    mockTransactionService.functions.getTransactionByIdAndAccountId.mockResolvedValue(queriedDocument);
    mockTransactionDocumentConverter.functions.toResponse.mockReturnValue(convertedResponse);

    const result = await service({
      transactionId,
      accountId,
    });
    expect(result).toEqual(convertedResponse);
    validateFunctionCall(mockTransactionService.functions.getTransactionByIdAndAccountId, {
      transactionId,
      accountId,
    });
    validateFunctionCall(mockTransactionDocumentConverter.functions.toResponse, queriedDocument, accountId);
    expect.assertions(3);
  });
  describe('should throw error', () => {
    it('if unable to query transaction', async () => {
      mockTransactionService.functions.getTransactionByIdAndAccountId.mockRejectedValue('this is a mongo error');

      await service({
        transactionId,
        accountId,
      }).catch(validateError('Error while getting transaction', 500));
      validateFunctionCall(mockTransactionService.functions.getTransactionByIdAndAccountId, {
        transactionId,
        accountId,
      });
      validateFunctionCall(mockTransactionDocumentConverter.functions.toResponse);
      expect.assertions(4);
    });

    it('if no transaction found', async () => {
      mockTransactionService.functions.getTransactionByIdAndAccountId.mockResolvedValue(undefined);

      await service({
        transactionId,
        accountId,
      }).catch(validateError('No transaction found', 404));
      validateFunctionCall(mockTransactionService.functions.getTransactionByIdAndAccountId, {
        transactionId,
        accountId,
      });
      validateFunctionCall(mockTransactionDocumentConverter.functions.toResponse);
      expect.assertions(4);
    });
  });
});
