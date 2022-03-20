import { default as handler } from '@household/api/functions/refresh-token/refresh-token.handler';
import { Auth } from '@household/shared/types/types';

describe('Login handler', () => {
  let mockLoginService: jest.Mock;
  let apiHandler: ReturnType<typeof handler>;

  beforeEach(() => {
    mockLoginService = jest.fn();

    apiHandler = handler(mockLoginService);
  });

  it('should respond with error if refresh token throws error', async () => {
    const handlerEvent = {
      body: '{}',
    } as AWSLambda.APIGatewayProxyEvent;

    const statusCode = 418;
    const message = 'This is an error';
    mockLoginService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await apiHandler(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;

    expect(response.statusCode).toEqual(statusCode);
    expect(response.body).toEqual(message);
  });

  it('should respond with HTTP 200 and token if refresh token executes successfully', async () => {
    const handlerEvent = {
      body: '{}',
    } as AWSLambda.APIGatewayProxyEvent;
    const tokens: Auth.RefreshToken.Response = {
      idToken: 'some.id.token',
    };
    mockLoginService.mockResolvedValue(tokens);

    const response = await apiHandler(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;

    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.body)).toEqual(tokens);
  });
});
