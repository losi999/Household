import { ILoginService, loginServiceFactory } from '@household/api/functions/login/login.service';
import { IIdentityService } from '@household/shared/services/identity-service';
import { Mock, createMockService, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { Auth } from '@household/shared/types/types';

describe('Login service', () => {
  let service: ILoginService;
  let mockIdentityService: Mock<IIdentityService>;

  beforeEach(() => {
    mockIdentityService = createMockService<IIdentityService>('login');

    service = loginServiceFactory(mockIdentityService.service);
  });

  it('should return with login credentials', async () => {
    const body = {} as Auth.Login.Request;
    const idToken = 'some.id.token';
    const refreshToken = 'some.refresh.token';

    mockIdentityService.functions.login.mockResolvedValue({
      AuthenticationResult: {
        IdToken: idToken,
        RefreshToken: refreshToken,
      },
    });

    const expectedResult: Auth.Login.Response = {
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
    const body = {} as Auth.Login.Request;

    mockIdentityService.functions.login.mockRejectedValue({
      message: 'This is a cognito error',
    });

    await service({
      body,
    }).catch(validateError('This is a cognito error', 500));
    validateFunctionCall(mockIdentityService.functions.login, body);
    expect.assertions(3);
  });
});
