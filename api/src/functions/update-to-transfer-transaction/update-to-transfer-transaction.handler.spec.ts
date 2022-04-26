import { MockBusinessService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { default as handler } from '@household/api/functions/update-to-transfer-transaction/update-to-transfer-transaction.handler';
import { IUpdateToTransferTransactionService } from '@household/api/functions/update-to-transfer-transaction/update-to-transfer-transaction.service';
import { createTransactionId, createTransferTransactionRequest } from '@household/shared/common/test-data-factory';
import { headerExpiresIn } from '@household/shared/constants';

describe('Update to transfer transaction handler', () => {
  let mockUpdateToTransferTransactionService: MockBusinessService<IUpdateToTransferTransactionService>;
  let handlerFunction: ReturnType<typeof handler>;

  beforeEach(() => {
    mockUpdateToTransferTransactionService = jest.fn();
    handlerFunction = handler(mockUpdateToTransferTransactionService);
  });

  const transactionId = createTransactionId();
  const body = createTransferTransactionRequest();
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
    mockUpdateToTransferTransactionService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockUpdateToTransferTransactionService, {
      transactionId,
      body,
      expiresIn,
    });
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
    expect.assertions(3);
  });

  it('should respond with success', async () => {
    mockUpdateToTransferTransactionService.mockResolvedValue(undefined);

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockUpdateToTransferTransactionService, {
      transactionId,
      body,
      expiresIn,
    });
    expect(response.statusCode).toEqual(201);
    expect(JSON.parse(response.body).transactionId).toEqual(transactionId);
    expect.assertions(3);
  });
});
