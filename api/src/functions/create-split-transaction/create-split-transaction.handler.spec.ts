import { MockBusinessService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { default as handler } from '@household/api/functions/create-split-transaction/create-split-transaction.handler';
import { ICreateSplitTransactionService } from '@household/api/functions/create-split-transaction/create-split-transaction.service';
import { createSplitTransactionRequest } from '@household/shared/common/test-data-factory';
import { headerExpiresIn } from '@household/shared/constants';

describe('Create split transaction handler', () => {
  let mockCreateSplitTransactionService: MockBusinessService<ICreateSplitTransactionService>;
  let handlerFunction: ReturnType<typeof handler>;

  beforeEach(() => {
    mockCreateSplitTransactionService = jest.fn();
    handlerFunction = handler(mockCreateSplitTransactionService);
  });
  const body = createSplitTransactionRequest();
  const expiresIn = 3600;
  const handlerEvent = {
    body: JSON.stringify(body),
    headers: {
      [headerExpiresIn]: `${expiresIn}`,
    } as AWSLambda.APIGatewayProxyEventHeaders,
  } as AWSLambda.APIGatewayProxyEvent;

  it('should handle business service error', async () => {

    const statusCode = 418;
    const message = 'This is an error';
    mockCreateSplitTransactionService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockCreateSplitTransactionService, {
      body,
      expiresIn,
    });
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
    expect.assertions(3);
  });

  it('should respond with success', async () => {
    const transactionId = 'transactionId';

    mockCreateSplitTransactionService.mockResolvedValue(transactionId);

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockCreateSplitTransactionService, {
      body,
      expiresIn,
    });
    expect(response.statusCode).toEqual(201);
    expect(JSON.parse(response.body).transactionId).toEqual(transactionId);
    expect.assertions(3);
  });
});
