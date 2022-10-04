import { MockBusinessService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { default as handler } from '@household/api/functions/create-account/create-account.handler';
import { ICreateAccountService } from '@household/api/functions/create-account/create-account.service';
import { createAccountId, createAccountRequest } from '@household/shared/common/test-data-factory';
import { headerExpiresIn } from '@household/shared/constants';

describe('Create account handler', () => {
  let mockCreateAccountService: MockBusinessService<ICreateAccountService>;
  let handlerFunction: ReturnType<typeof handler>;

  beforeEach(() => {
    mockCreateAccountService = jest.fn();
    handlerFunction = handler(mockCreateAccountService);
  });
  const body = createAccountRequest();
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
    mockCreateAccountService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockCreateAccountService, {
      body,
      expiresIn,
    });
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
    expect.assertions(3);
  });

  it('should respond with success', async () => {
    const accountId = createAccountId();

    mockCreateAccountService.mockResolvedValue(accountId);

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockCreateAccountService, {
      body,
      expiresIn,
    });
    expect(response.statusCode).toEqual(201);
    expect(JSON.parse(response.body).accountId).toEqual(accountId);
    expect.assertions(3);
  });
});
