import { default as handler } from '@household/api/functions/create-user/create-user.handler';
import { ICreateUserService } from '@household/api/functions/create-user/create-user.service';
import { MockBusinessService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { headerSuppressEmail } from '@household/shared/constants';

describe('Create user handler', () => {
  let mockCreateUserService: MockBusinessService<ICreateUserService>;
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
      suppressEmail: undefined,
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
      suppressEmail: undefined,
    });
    expect(response.statusCode).toEqual(201);
    expect.assertions(2);
  });

  it('should respond with success if create user executes successfully with email sending suppressed', async () => {
    mockCreateUserService.mockResolvedValue(undefined);

    const response = await apiHandler({
      ...handlerEvent,
      headers: {
        [headerSuppressEmail]: 'true',
      },
    }, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockCreateUserService, {
      body,
      suppressEmail: true,
    });
    expect(response.statusCode).toEqual(201);
    expect.assertions(2);
  });

  it('should respond with success if create user executes successfully with explicit false on email suppress', async () => {
    mockCreateUserService.mockResolvedValue(undefined);

    const response = await apiHandler({
      ...handlerEvent,
      headers: {
        [headerSuppressEmail]: 'FALSE',
      },
    }, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockCreateUserService, {
      body,
      suppressEmail: false,
    });
    expect(response.statusCode).toEqual(201);
    expect.assertions(2);
  });
});
