import { MockBusinessService } from '@household/shared/common/unit-testing';
import { default as handler } from '@household/api/functions/report-transactions/report-transactions.handler';
import { IReportTransactionsService } from '@household/api/functions/report-transactions/report-transactions.service';
import { createTransactionReport } from '@household/shared/common/test-data-factory';

describe('Report transactions handler', () => {
  let mockListTransactionsService: MockBusinessService<IReportTransactionsService>;
  let handlerFunction: ReturnType<typeof handler>;

  beforeEach(() => {
    mockListTransactionsService = jest.fn();
    handlerFunction = handler(mockListTransactionsService);
  });

  const transactions = [createTransactionReport()];
  const handlerEvent = {
    body: '{}',
  } as AWSLambda.APIGatewayProxyEvent;

  it('should handle business service error', async () => {
    const statusCode = 418;
    const message = 'This is an error';
    mockListTransactionsService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    expect(mockListTransactionsService).toHaveBeenCalled();
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
    expect.assertions(3);
  });

  it('should respond with success', async () => {
    mockListTransactionsService.mockResolvedValue(transactions);

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    expect(mockListTransactionsService).toHaveBeenCalled();
    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.body)).toEqual(transactions);
    expect.assertions(3);
  });
});
