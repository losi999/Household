import { ILoginService, loginServiceFactory } from '@household/api/functions/login/login.service';
import { IIdentityService } from '@household/shared/services/identity-service';
import { MockService, createMockService, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { Requests } from '@household/shared/types/requests';
import { Responses } from '@household/shared/types/responses';

describe('Login service', () => {
  let service: ILoginService;
  let mockIdentityService: MockService<IIdentityService>;

  beforeEach(() => {
    mockIdentityService = createMockService<IIdentityService>('login');

    service = loginServiceFactory(mockIdentityService.service);
  });

  it('should return with login credentials', async () => {
    const body = {} as Requests.Login;
    const idToken = 'some.id.token';
    const refreshToken = 'some.refresh.token';

    mockIdentityService.functions.login.mockResolvedValue({
      AuthenticationResult: {
        IdToken: idToken,
        RefreshToken: refreshToken,
      },
    });

    const expectedResult: Responses.Login = {
      idToken,
      refreshToken,
    };

    const result = await service({
      body,
    });
    expect(result).toEqual(expectedResult);
    validateFunctionCall(mockIdentityService.functions.login, body);
  });

  it('should throw error if unable to login', async () => {
    const body = {} as Requests.Login;

    mockIdentityService.functions.login.mockRejectedValue('This is a cognito error');

    await service({
      body,
    }).catch(validateError('Error while logging in', 500));
    validateFunctionCall(mockIdentityService.functions.login, body);
    expect.assertions(3);
  });
});
