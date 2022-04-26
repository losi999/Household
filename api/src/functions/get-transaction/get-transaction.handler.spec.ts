import { MockBusinessService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { default as handler } from '@household/api/functions/get-transaction/get-transaction.handler';
import { IGetTransactionService } from '@household/api/functions/get-transaction/get-transaction.service';
import { createAccountId, createPaymentTransactionResponse, createTransactionId } from '@household/shared/common/test-data-factory';

describe('Get transaction handler', () => {
  let mockGetTransactionService: MockBusinessService<IGetTransactionService>;
  let handlerFunction: ReturnType<typeof handler>;

  beforeEach(() => {
    mockGetTransactionService = jest.fn();
    handlerFunction = handler(mockGetTransactionService);
  });

  const transactionId = createTransactionId();
  const accountId = createAccountId();
  const transaction = createPaymentTransactionResponse();
  const handlerEvent = {
    pathParameters: {
      transactionId,
      accountId,
    } as AWSLambda.APIGatewayProxyEventPathParameters,
  } as AWSLambda.APIGatewayProxyEvent;

  it('should handle business service error', async () => {
    const statusCode = 418;
    const message = 'This is an error';
    mockGetTransactionService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockGetTransactionService, {
      transactionId,
      accountId,
    });
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
    expect.assertions(3);
  });

  it('should respond with success', async () => {
    mockGetTransactionService.mockResolvedValue(transaction);

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockGetTransactionService, {
      transactionId,
      accountId,
    });
    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.body)).toEqual(transaction);
    expect.assertions(3);
  });
});
