import { default as handler } from '@household/api/functions/delete-user/delete-user.handler';
import { validateFunctionCall } from '@household/shared/common/unit-testing';

describe('Delete user handler', () => {
  let mockDeleteUserService: jest.Mock;
  let apiHandler: ReturnType<typeof handler>;

  beforeEach(() => {
    mockDeleteUserService = jest.fn();

    apiHandler = handler(mockDeleteUserService);
  });

  const email = 'user@email.com';
  const handlerEvent = {
    pathParameters: {
      email,
    } as AWSLambda.APIGatewayProxyEventPathParameters,
  } as AWSLambda.APIGatewayProxyEvent;

  it('should respond with error if service throws error', async () => {
    const statusCode = 418;
    const message = 'This is an error';
    mockDeleteUserService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await apiHandler(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockDeleteUserService, {
      email,
    });
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
    expect.assertions(3);
  });

  it('should respond with success if delete user executes successfully', async () => {
    mockDeleteUserService.mockResolvedValue(undefined);

    const response = await apiHandler(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockDeleteUserService, {
      email,
    });
    expect(response.statusCode).toEqual(201);
    expect.assertions(2);
  });
});
