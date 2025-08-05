import { default as handler } from '@household/api/functions/confirm-forgot-password/confirm-forgot-password-handler';
import { IConfirmForgotPasswordService } from '@household/api/functions/confirm-forgot-password/confirm-forgot-password-service';
import { createConfirmForgotPasswordRequest } from '@household/shared/common/test-data-factory';
import { MockBusinessService, validateFunctionCall } from '@household/shared/common/unit-testing';

describe('Confirm forgot password handler', () => {
  let mockConfirmForgotPasswordService: MockBusinessService<IConfirmForgotPasswordService>;
  let apiHandler: ReturnType<typeof handler>;

  beforeEach(() => {
    mockConfirmForgotPasswordService = jest.fn();

    apiHandler = handler(mockConfirmForgotPasswordService);
  });

  const email = 'email@email.com';
  const body = createConfirmForgotPasswordRequest();
  const handlerEvent = {
    pathParameters: {
      email,
    } as AWSLambda.APIGatewayProxyEventPathParameters,
    body: JSON.stringify(body),
  } as AWSLambda.APIGatewayProxyEvent;

  it('should respond with error if confirm forgot password throws error', async () => {
    const statusCode = 418;
    const message = 'This is an error';
    mockConfirmForgotPasswordService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await apiHandler(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockConfirmForgotPasswordService, {
      body,
      email,
    });
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
  });

  it('should respond with HTTP 200 if confirm forgot password executes successfully', async () => {
    mockConfirmForgotPasswordService.mockResolvedValue(undefined);

    const response = await apiHandler(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockConfirmForgotPasswordService, {
      body,
      email,
    });
    expect(response.statusCode).toEqual(200);
  });
});
