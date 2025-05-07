import { default as handler } from '@household/api/functions/confirm-user/confirm-user.handler';
import { createConfirmUserRequest } from '@household/shared/common/test-data-factory';
import { validateFunctionCall } from '@household/shared/common/unit-testing';

describe('Confirm user handler', () => {
  let mockConfirmUserService: jest.Mock;
  let apiHandler: ReturnType<typeof handler>;

  beforeEach(() => {
    mockConfirmUserService = jest.fn();

    apiHandler = handler(mockConfirmUserService);
  });

  const email = 'user@email.com';
  const body = createConfirmUserRequest();
  const handlerEvent = {
    pathParameters: {
      email,
    } as AWSLambda.APIGatewayProxyEventPathParameters,
    body: JSON.stringify(body),
  } as AWSLambda.APIGatewayProxyEvent;

  it('should respond with error if service throws error', async () => {
    const statusCode = 418;
    const message = 'This is an error';
    mockConfirmUserService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await apiHandler(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockConfirmUserService, {
      body,
      email,
    });
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
    expect.assertions(3);
  });

  it('should respond with success if confirm user executes successfully', async () => {
    mockConfirmUserService.mockResolvedValue(undefined);

    const response = await apiHandler(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockConfirmUserService, {
      body,
      email,
    });
    expect(response.statusCode).toEqual(201);
    expect.assertions(2);
  });
});
