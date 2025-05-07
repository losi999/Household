import { default as handler } from '@household/api/functions/create-user/create-user.handler';
import { validateFunctionCall } from '@household/shared/common/unit-testing';

describe('Create user handler', () => {
  let mockCreateUserService: jest.Mock;
  let apiHandler: ReturnType<typeof handler>;

  beforeEach(() => {
    mockCreateUserService = jest.fn();

    apiHandler = handler(mockCreateUserService);
  });

  const email = 'user@email.com';
  const body = {
    email,
  };
  const handlerEvent = {
    body: JSON.stringify(body),
  } as AWSLambda.APIGatewayProxyEvent;

  it('should respond with error if service throws error', async () => {
    const statusCode = 418;
    const message = 'This is an error';
    mockCreateUserService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await apiHandler(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockCreateUserService, {
      body,
    });
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
    expect.assertions(3);
  });

  it('should respond with success if create user executes successfully', async () => {
    mockCreateUserService.mockResolvedValue(undefined);

    const response = await apiHandler(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockCreateUserService, {
      body,
    });
    expect(response.statusCode).toEqual(201);
    expect.assertions(2);
  });
});
