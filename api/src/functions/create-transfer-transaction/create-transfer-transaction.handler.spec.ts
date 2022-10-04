import { MockBusinessService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { default as handler } from '@household/api/functions/create-transfer-transaction/create-transfer-transaction.handler';
import { ICreateTransferTransactionService } from '@household/api/functions/create-transfer-transaction/create-transfer-transaction.service';
import { createTransactionId, createTransferTransactionRequest } from '@household/shared/common/test-data-factory';
import { headerExpiresIn } from '@household/shared/constants';

describe('Create transfer transaction handler', () => {
  let mockCreateTransferTransactionService: MockBusinessService<ICreateTransferTransactionService>;
  let handlerFunction: ReturnType<typeof handler>;

  beforeEach(() => {
    mockCreateTransferTransactionService = jest.fn();
    handlerFunction = handler(mockCreateTransferTransactionService);
  });

  const body = createTransferTransactionRequest();
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
    mockCreateTransferTransactionService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockCreateTransferTransactionService, {
      body,
      expiresIn,
    });
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
    expect.assertions(3);
  });

  it('should respond with success', async () => {
    const transactionId = createTransactionId();

    mockCreateTransferTransactionService.mockResolvedValue(transactionId);

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockCreateTransferTransactionService, {
      body,
      expiresIn,
    });
    expect(response.statusCode).toEqual(201);
    expect(JSON.parse(response.body).transactionId).toEqual(transactionId);
    expect.assertions(3);
  });
});
