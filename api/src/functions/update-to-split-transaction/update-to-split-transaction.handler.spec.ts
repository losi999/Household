import { MockBusinessService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { default as handler } from '@household/api/functions/update-to-split-transaction/update-to-split-transaction.handler';
import { IUpdateToSplitTransactionService } from '@household/api/functions/update-to-split-transaction/update-to-split-transaction.service';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { headerExpiresIn } from '@household/shared/constants';

describe('Update to split transaction handler', () => {
  let mockUpdateToSplitTransactionService: MockBusinessService<IUpdateToSplitTransactionService>;
  let handlerFunction: ReturnType<typeof handler>;

  beforeEach(() => {
    mockUpdateToSplitTransactionService = vi.fn();
    handlerFunction = handler(mockUpdateToSplitTransactionService);
  });

  const transactionId = testDataFactory.transaction.id();
  const body = testDataFactory.transaction.request.split();
  const expiresIn = 3600;
  const handlerEvent = {
    body: JSON.stringify(body),
    pathParameters: {
      transactionId,
    } as AWSLambda.APIGatewayProxyEventPathParameters,
    headers: {
      [headerExpiresIn]: `${expiresIn}`,
    } as AWSLambda.APIGatewayProxyEventHeaders,
  } as AWSLambda.APIGatewayProxyEvent;

  it('should handle business service error', async () => {
    const statusCode = 418;
    const message = 'This is an error';
    mockUpdateToSplitTransactionService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockUpdateToSplitTransactionService, {
      transactionId,
      body,
      expiresIn,
    });
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
    expect.assertions(3);
  });

  it('should respond with success', async () => {
    mockUpdateToSplitTransactionService.mockResolvedValue(undefined);

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockUpdateToSplitTransactionService, {
      transactionId,
      body,
      expiresIn,
    });
    expect(response.statusCode).toEqual(204);
    expect.assertions(2);
  });
});
