import { IListTransactionsService, listTransactionsServiceFactory } from '@household/api/functions/list-transactions/list-transactions.service';
import { createAccountId, createPaymentTransactionDocument, createTransactionReport } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { IReportDocumentConverter } from '@household/shared/converters/report-document-converter';
import { ITransactionDocumentConverter } from '@household/shared/converters/transaction-document-converter';
import { ITransactionService } from '@household/shared/services/transaction-service';
import { Report } from '@household/shared/types/types';
import { PipelineStage } from 'mongoose';

describe('List transactions service', () => {
  let service: IListTransactionsService;
  let mockReportDocumentConverter: Mock<IReportDocumentConverter>;
  let mockTransactionService: Mock<ITransactionService>;
  let mockTransactionDocumentConverter: Mock<ITransactionDocumentConverter>;

  beforeEach(() => {
    mockReportDocumentConverter = createMockService('createFilterQuery');
    mockTransactionService = createMockService('listTransactions');
    mockTransactionDocumentConverter = createMockService('toReportList');

    service = listTransactionsServiceFactory(mockReportDocumentConverter.service, mockTransactionService.service, mockTransactionDocumentConverter.service);
  });

  const queriedDocument = createPaymentTransactionDocument();
  const convertedReport = createTransactionReport();
  const body: Report.Request = [
    {
      filterType: 'account',
      items: [createAccountId()],
      exclude: false,
    },
  ];
  const firstMatch: PipelineStage.Match = {
    $match: {
      $and: [],
    },
  };

  const secondMatch: PipelineStage.Match = {
    $match: {
      $or: [],
    },
  };

  it('should return report items', async () => {
    mockReportDocumentConverter.functions.createFilterQuery.mockReturnValue([
      firstMatch,
      secondMatch,
    ]);
    mockTransactionService.functions.listTransactions.mockResolvedValue([queriedDocument]);
    mockTransactionDocumentConverter.functions.toReportList.mockReturnValue([convertedReport]);

    const result = await service(body);
    expect(result).toEqual([convertedReport]);
    validateFunctionCall(mockReportDocumentConverter.functions.createFilterQuery, body);
    validateFunctionCall(mockTransactionService.functions.listTransactions, firstMatch, secondMatch);
    validateFunctionCall(mockTransactionDocumentConverter.functions.toReportList, [queriedDocument]);
    expect.assertions(4);
  });

  describe('should throw error', () => {
    it('if unable to query transactions', async () => {
      mockReportDocumentConverter.functions.createFilterQuery.mockReturnValue([
        firstMatch,
        secondMatch,
      ]);
      mockTransactionService.functions.listTransactions.mockRejectedValue('this is a mongo error');

      await service(body).catch(validateError('Error while listing transactions', 500));
      validateFunctionCall(mockReportDocumentConverter.functions.createFilterQuery, body);
      validateFunctionCall(mockTransactionService.functions.listTransactions, firstMatch, secondMatch);
      validateFunctionCall(mockTransactionDocumentConverter.functions.toReportList);
      expect.assertions(5);
    });
  });
});
