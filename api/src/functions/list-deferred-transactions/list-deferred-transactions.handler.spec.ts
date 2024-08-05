import { MockBusinessService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { default as handler } from '@household/api/functions/list-deferred-transactions/list-deferred-transactions.handler';
import { createDeferredTransactionResponse, createTransactionId } from '@household/shared/common/test-data-factory';
import { IListDeferredTransactionsService } from '@household/api/functions/list-deferred-transactions/list-deferred-transactions.service';

describe('List transactions handler', () => {
  let mockListTransactionsService: MockBusinessService<IListDeferredTransactionsService>;
  let handlerFunction: ReturnType<typeof handler>;

  beforeEach(() => {
    mockListTransactionsService = jest.fn();
    handlerFunction = handler(mockListTransactionsService);
  });
  const transactions = [createDeferredTransactionResponse()];

  const transactionId = createTransactionId();

  const handlerEvent = {
    queryStringParameters: {
      isSettled: 'true',
    } as AWSLambda.APIGatewayProxyEventQueryStringParameters,
    multiValueQueryStringParameters: {
      transactionId: [transactionId],
    } as AWSLambda.APIGatewayProxyEventMultiValueQueryStringParameters,
  } as AWSLambda.APIGatewayProxyEvent;

  it('should handle business service error', async () => {
    const statusCode = 418;
    const message = 'This is an error';
    mockListTransactionsService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockListTransactionsService, {
      isSettled: true,
      transactionIds: [transactionId],
    });
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
    expect.assertions(3);
  });

  it('should respond with success', async () => {
    mockListTransactionsService.mockResolvedValue(transactions);

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockListTransactionsService, {
      isSettled: true,
      transactionIds: [transactionId],
    });
    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.body)).toEqual(transactions);
    expect.assertions(3);
  });
});
