import { IListTransactionsService, listTransactionsServiceFactory } from '@household/api/functions/list-transactions/list-transactions.service';
import { createPaymentTransactionDocument, createPaymentTransactionResponse } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { IReportDocumentConverter } from '@household/shared/converters/report-document-converter';
import { ITransactionDocumentConverter } from '@household/shared/converters/transaction-document-converter';
import { ITransactionService } from '@household/shared/services/transaction-service';

describe('List transactions service', () => {
  let service: IListTransactionsService;
  let mockReportDocumentConverter: Mock<IReportDocumentConverter>;
  let mockTransactionService: Mock<ITransactionService>;
  let mockTransactionDocumentConverter: Mock<ITransactionDocumentConverter>;

  beforeEach(() => {
    mockReportDocumentConverter = createMockService('createFilterQuery');
    mockTransactionService = createMockService('listTransactions');
    mockTransactionDocumentConverter = createMockService('toResponseList');

    service = listTransactionsServiceFactory(mockReportDocumentConverter.service, mockTransactionService.service, mockTransactionDocumentConverter.service);
  });

  const queriedDocument = createPaymentTransactionDocument();
  const convertedResponse = createPaymentTransactionResponse();

  it.todo('should be done');

  // it('should return documents', async () => {
  //   mockTransactionService.functions.listTransactions.mockResolvedValue([queriedDocument]);
  //   mockTransactionDocumentConverter.functions.toResponseList.mockReturnValue([convertedResponse]);

  //   const result = await service();
  //   expect(result).toEqual([convertedResponse]);
  //   expect(mockTransactionService.functions.listTransactions).toHaveBeenCalled();
  //   validateFunctionCall(mockTransactionDocumentConverter.functions.toResponseList, [queriedDocument]);
  //   expect.assertions(3);
  // });

  // describe('should throw error', () => {
  //   it('if unable to query transactions', async () => {
  //     mockTransactionService.functions.listTransactions.mockRejectedValue('this is a mongo error');

  //     await service().catch(validateError('Error while listing transactions', 500));
  //     expect(mockTransactionService.functions.listTransactions).toHaveBeenCalled();
  //     validateFunctionCall(mockTransactionDocumentConverter.functions.toResponseList);
  //     expect.assertions(4);
  //   });
  // });
});
