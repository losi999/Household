import { MockBusinessService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { default as handler } from '@household/api/functions/update-account/update-account.handler';
import { IUpdateAccountService } from '@household/api/functions/update-account/update-account.service';
import { createAccountId, createAccountRequest } from '@household/shared/common/test-data-factory';
import { headerExpiresIn } from '@household/shared/constants';

describe('Update account handler', () => {
  let mockUpdateAccountService: MockBusinessService<IUpdateAccountService>;
  let handlerFunction: ReturnType<typeof handler>;

  beforeEach(() => {
    mockUpdateAccountService = jest.fn();
    handlerFunction = handler(mockUpdateAccountService);
  });

  const accountId = createAccountId();
  const body = createAccountRequest();
  const expiresIn = 3600;
  const handlerEvent = {
    body: JSON.stringify(body),
    pathParameters: {
      accountId,
    } as AWSLambda.APIGatewayProxyEventPathParameters,
    headers: {
      [headerExpiresIn]: `${expiresIn}`,
    } as AWSLambda.APIGatewayProxyEventHeaders,
  } as AWSLambda.APIGatewayProxyEvent;

  it('should handle business service error', async () => {
    const statusCode = 418;
    const message = 'This is an error';
    mockUpdateAccountService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockUpdateAccountService, {
      accountId,
      body,
      expiresIn,
    });
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
    expect.assertions(3);
  });

  it('should respond with success', async () => {
    mockUpdateAccountService.mockResolvedValue(undefined);

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockUpdateAccountService, {
      accountId,
      body,
      expiresIn,
    });
    expect(response.statusCode).toEqual(201);
    expect(JSON.parse(response.body).accountId).toEqual(accountId);
    expect.assertions(3);
  });
});
