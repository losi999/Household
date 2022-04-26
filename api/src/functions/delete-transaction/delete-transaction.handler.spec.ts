import { MockBusinessService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { default as handler } from '@household/api/functions/delete-transaction/delete-transaction.handler';
import { IDeleteTransactionService } from '@household/api/functions/delete-transaction/delete-transaction.service';
import { createTransactionId } from '@household/shared/common/test-data-factory';

describe('Delete transaction handler', () => {
  let mockDeleteTransactionService: MockBusinessService<IDeleteTransactionService>;
  let handlerFunction: ReturnType<typeof handler>;

  beforeEach(() => {
    mockDeleteTransactionService = jest.fn();
    handlerFunction = handler(mockDeleteTransactionService);
  });

  const transactionId = createTransactionId();
  const handlerEvent = {
    pathParameters: {
      transactionId,
    } as AWSLambda.APIGatewayProxyEventPathParameters,
  } as AWSLambda.APIGatewayProxyEvent;

  it('should handle business service error', async () => {
    const statusCode = 418;
    const message = 'This is an error';
    mockDeleteTransactionService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockDeleteTransactionService, {
      transactionId,
    });
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
    expect.assertions(3);
  });

  it('should respond with success', async () => {
    mockDeleteTransactionService.mockResolvedValue(undefined);

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockDeleteTransactionService, {
      transactionId,
    });
    expect(response.statusCode).toEqual(204);
    expect.assertions(2);
  });
});
