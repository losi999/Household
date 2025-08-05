import { default as handler } from '@household/api/functions/forgot-password/forgot-password-handler';
import { IForgotPasswordService } from '@household/api/functions/forgot-password/forgot-password-service';
import { MockBusinessService, validateFunctionCall } from '@household/shared/common/unit-testing';

describe('Forgot password handler', () => {
  let mockForgotPasswordService: MockBusinessService<IForgotPasswordService>;
  let apiHandler: ReturnType<typeof handler>;

  beforeEach(() => {
    mockForgotPasswordService = jest.fn();

    apiHandler = handler(mockForgotPasswordService);
  });

  const email = 'user@email.com';
  const body = {
    email,
  };
  const handlerEvent = {
    body: JSON.stringify(body),
  } as AWSLambda.APIGatewayProxyEvent;

  it('should respond with error if forgot password throws error', async () => {
    const statusCode = 418;
    const message = 'This is an error';
    mockForgotPasswordService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await apiHandler(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockForgotPasswordService, {
      body,
    });
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
  });

  it('should respond with HTTP 200 if forgot password executes successfully', async () => {
    mockForgotPasswordService.mockResolvedValue(undefined);

    const response = await apiHandler(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockForgotPasswordService, {
      body,
    });
    expect(response.statusCode).toEqual(200);
  });
});
