import { IListDeferredTransactionsService, listDeferredTransactionsServiceFactory } from '@household/api/functions/list-deferred-transactions/list-deferred-transactions.service';
import { createDeferredTransactionDocument, createDeferredTransactionResponse } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { getTransactionId } from '@household/shared/common/utils';
import { IDeferredTransactionDocumentConverter } from '@household/shared/converters/deferred-transaction-document-converter';
import { ITransactionService } from '@household/shared/services/transaction-service';

describe('List deferred transactions service', () => {
  let service: IListDeferredTransactionsService;
  let mockTransactionService: Mock<ITransactionService>;
  let mockTransactionDocumentConverter: Mock<IDeferredTransactionDocumentConverter>;

  beforeEach(() => {
    mockTransactionService = createMockService('listDeferredTransactions');
    mockTransactionDocumentConverter = createMockService('toResponseList');

    service = listDeferredTransactionsServiceFactory(mockTransactionService.service, mockTransactionDocumentConverter.service);
  });

  const settledDocument = createDeferredTransactionDocument({
    remainingAmount: 0,
  });
  const explicitDocument = createDeferredTransactionDocument();
  const notSettledocument = createDeferredTransactionDocument();
  const convertedResponse = createDeferredTransactionResponse();

  describe('should return documents', () => {
    it('without filtering', async () => {
      mockTransactionService.functions.listDeferredTransactions.mockResolvedValue([
        settledDocument,
        explicitDocument,
        notSettledocument,
      ]);
      mockTransactionDocumentConverter.functions.toResponseList.mockReturnValue([convertedResponse]);

      const result = await service({
        isSettled: undefined,
        transactionIds: undefined,
      });
      expect(result).toEqual([convertedResponse]);
      expect(mockTransactionService.functions.listDeferredTransactions).toHaveBeenCalled();
      validateFunctionCall(mockTransactionDocumentConverter.functions.toResponseList, [
        settledDocument,
        explicitDocument,
        notSettledocument,
      ]);
      expect.assertions(3);
    });

    it('with settled filtering', async () => {
      mockTransactionService.functions.listDeferredTransactions.mockResolvedValue([
        settledDocument,
        explicitDocument,
        notSettledocument,
      ]);
      mockTransactionDocumentConverter.functions.toResponseList.mockReturnValue([convertedResponse]);

      const result = await service({
        isSettled: true,
        transactionIds: undefined,
      });
      expect(result).toEqual([convertedResponse]);
      expect(mockTransactionService.functions.listDeferredTransactions).toHaveBeenCalled();
      validateFunctionCall(mockTransactionDocumentConverter.functions.toResponseList, [settledDocument]);
      expect.assertions(3);
    });

    it('with NOT settled filtering', async () => {
      mockTransactionService.functions.listDeferredTransactions.mockResolvedValue([
        settledDocument,
        explicitDocument,
        notSettledocument,
      ]);
      mockTransactionDocumentConverter.functions.toResponseList.mockReturnValue([convertedResponse]);

      const result = await service({
        isSettled: false,
        transactionIds: undefined,
      });
      expect(result).toEqual([convertedResponse]);
      expect(mockTransactionService.functions.listDeferredTransactions).toHaveBeenCalled();
      validateFunctionCall(mockTransactionDocumentConverter.functions.toResponseList, [
        explicitDocument,
        notSettledocument,
      ]);
      expect.assertions(3);
    });

    it('with explicit transactionId filtering', async () => {
      mockTransactionService.functions.listDeferredTransactions.mockResolvedValue([
        settledDocument,
        explicitDocument,
        notSettledocument,
      ]);
      mockTransactionDocumentConverter.functions.toResponseList.mockReturnValue([convertedResponse]);

      const result = await service({
        isSettled: undefined,
        transactionIds: [getTransactionId(explicitDocument)],
      });
      expect(result).toEqual([convertedResponse]);
      expect(mockTransactionService.functions.listDeferredTransactions).toHaveBeenCalled();
      validateFunctionCall(mockTransactionDocumentConverter.functions.toResponseList, [explicitDocument]);
      expect.assertions(3);
    });

    it('with both filtering', async () => {
      mockTransactionService.functions.listDeferredTransactions.mockResolvedValue([
        settledDocument,
        explicitDocument,
        notSettledocument,
      ]);
      mockTransactionDocumentConverter.functions.toResponseList.mockReturnValue([convertedResponse]);

      const result = await service({
        isSettled: true,
        transactionIds: [getTransactionId(explicitDocument)],
      });
      expect(result).toEqual([convertedResponse]);
      expect(mockTransactionService.functions.listDeferredTransactions).toHaveBeenCalled();
      validateFunctionCall(mockTransactionDocumentConverter.functions.toResponseList, [
        settledDocument,
        explicitDocument,
      ]);
      expect.assertions(3);
    });
  });
  describe('should throw error', () => {
    it('if unable to query transactions', async () => {
      mockTransactionService.functions.listDeferredTransactions.mockRejectedValue('this is a mongo error');

      await service({
        isSettled: undefined,
        transactionIds: undefined,
      }).catch(validateError('Error while listing transactions', 500));
      expect(mockTransactionService.functions.listDeferredTransactions).toHaveBeenCalled();
      validateFunctionCall(mockTransactionDocumentConverter.functions.toResponseList);
      expect.assertions(4);
    });
  });
});
