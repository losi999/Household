import { default as handler } from '@household/api/functions/refresh-token/refresh-token.handler';
import { IRefreshTokenService } from '@household/api/functions/refresh-token/refresh-token.service';
import { MockBusinessService } from '@household/shared/common/unit-testing';
import { Auth } from '@household/shared/types/types';

describe('Refresh token handler', () => {
  let mockRefreshTokenLoginService: MockBusinessService<IRefreshTokenService>;
  let apiHandler: ReturnType<typeof handler>;

  beforeEach(() => {
    mockRefreshTokenLoginService = jest.fn();

    apiHandler = handler(mockRefreshTokenLoginService);
  });

  it('should respond with error if refresh token throws error', async () => {
    const handlerEvent = {
      body: '{}',
    } as AWSLambda.APIGatewayProxyEvent;

    const statusCode = 418;
    const message = 'This is an error';
    mockRefreshTokenLoginService.mockRejectedValue({
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
    mockRefreshTokenLoginService.mockResolvedValue(tokens);

    const response = await apiHandler(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;

    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.body)).toEqual(tokens);
  });
});
