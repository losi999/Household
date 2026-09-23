import { default as handler } from '@household/api/functions/login/login.handler';
import { ILoginService } from '@household/api/functions/login/login.service';
import { MockBusinessService } from '@household/shared/common/unit-testing';
import { Responses } from '@household/shared/types/responses';

describe('Login handler', () => {
  let mockLoginService: MockBusinessService<ILoginService>;
  let apiHandler: ReturnType<typeof handler>;

  beforeEach(() => {
    mockLoginService = vi.fn();

    apiHandler = handler(mockLoginService);
  });

  it('should respond with error if login throws error', async () => {
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
    expect(JSON.parse(response.body).message).toEqual(message);
  });

  it('should respond with HTTP 200 and tokens if login executes successfully', async () => {
    const handlerEvent = {
      body: '{}',
    } as AWSLambda.APIGatewayProxyEvent;
    const tokens: Responses.Login = {
      idToken: 'some.id.token',
      refreshToken: 'some.refresh.token',
    };
    mockLoginService.mockResolvedValue(tokens);

    const response = await apiHandler(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;

    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.body)).toEqual(tokens);
  });
});
