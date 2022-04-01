import { MockBusinessService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { default as handler } from '@household/api/functions/get-account/get-account.handler';
import { IGetAccountService } from '@household/api/functions/get-account/get-account.service';
import { createAccountId, createAccountResponse } from '@household/shared/common/test-data-factory';

describe('Get account handler', () => {
  let mockGetAccountService: MockBusinessService<IGetAccountService>;
  let handlerFunction: ReturnType<typeof handler>;

  beforeEach(() => {
    mockGetAccountService = jest.fn();
    handlerFunction = handler(mockGetAccountService);
  });

  const accountId = createAccountId();
  const account = createAccountResponse();
  const handlerEvent = {
    pathParameters: {
      accountId,
    } as AWSLambda.APIGatewayProxyEventPathParameters,
  } as AWSLambda.APIGatewayProxyEvent;

  it('should handle business service error', async () => {
    const statusCode = 418;
    const message = 'This is an error';
    mockGetAccountService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockGetAccountService, {
      accountId,
    });
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
    expect.assertions(3);
  });

  it('should respond with success', async () => {
    mockGetAccountService.mockResolvedValue(account);

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockGetAccountService, {
      accountId,
    });
    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.body)).toEqual(account);
    expect.assertions(3);
  });
});
