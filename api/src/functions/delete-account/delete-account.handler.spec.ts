import { MockBusinessService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { default as handler } from '@household/api/functions/delete-account/delete-account.handler';
import { IDeleteAccountService } from '@household/api/functions/delete-account/delete-account.service';
import { createAccountId } from '@household/shared/common/test-data-factory';

describe('Delete account handler', () => {
  let mockDeleteAccountService: MockBusinessService<IDeleteAccountService>;
  let handlerFunction: ReturnType<typeof handler>;

  beforeEach(() => {
    mockDeleteAccountService = jest.fn();
    handlerFunction = handler(mockDeleteAccountService);
  });

  const accountId = createAccountId();
  const handlerEvent = {
    pathParameters: {
      accountId,
    } as AWSLambda.APIGatewayProxyEventPathParameters,
  } as AWSLambda.APIGatewayProxyEvent;

  it('should handle business service error', async () => {
    const statusCode = 418;
    const message = 'This is an error';
    mockDeleteAccountService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockDeleteAccountService, {
      accountId,
    });
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
    expect.assertions(3);
  });

  it('should respond with success', async () => {
    mockDeleteAccountService.mockResolvedValue(undefined);

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockDeleteAccountService, {
      accountId,
    });
    expect(response.statusCode).toEqual(204);
    expect.assertions(2);
  });
});
