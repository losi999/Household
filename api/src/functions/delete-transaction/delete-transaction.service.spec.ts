import { IDeleteTransactionService, deleteTransactionServiceFactory } from '@household/api/functions/delete-transaction/delete-transaction.service';
import { createTransactionId } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { ITransactionService } from '@household/shared/services/transaction-service';

describe('Delete transaction service', () => {
  let service: IDeleteTransactionService;
  let mockTransactionService: Mock<ITransactionService>;

  beforeEach(() => {
    mockTransactionService = createMockService('deleteTransaction');

    service = deleteTransactionServiceFactory(mockTransactionService.service);
  });

  const transactionId = createTransactionId();

  it('should return if document is deleted', async () => {
    mockTransactionService.functions.deleteTransaction.mockResolvedValue(undefined);

    await service({
      transactionId,
    });
    validateFunctionCall(mockTransactionService.functions.deleteTransaction, transactionId);
    expect.assertions(1);
  });

  describe('should throw error', () => {
    it('if unable to delete document', async () => {
      mockTransactionService.functions.deleteTransaction.mockRejectedValue('this is a mongo error');

      await service({
        transactionId,
      }).catch(validateError('Error while deleting transaction', 500));
      validateFunctionCall(mockTransactionService.functions.deleteTransaction, transactionId);
      expect.assertions(3);
    });
  });
});
