import { IRefreshTokenService, refreshTokenServiceFactory } from '@household/api/functions/refresh-token/refresh-token.service';
import { IIdentityService } from '@household/shared/services/identity-service';
import { Mock, createMockService, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { Auth } from '@household/shared/types/types';

describe('Refresh token service', () => {
  let service: IRefreshTokenService;
  let mockIdentityService: Mock<IIdentityService>;

  beforeEach(() => {
    mockIdentityService = createMockService<IIdentityService>('refreshToken');

    service = refreshTokenServiceFactory(mockIdentityService.service);
  });

  const body = {} as Auth.RefreshToken.Request;
  const idToken = 'some.id.token';
  it('should return with id token', async () => {

    mockIdentityService.functions.refreshToken.mockResolvedValue({
      AuthenticationResult: {
        IdToken: idToken,
      },
    });

    const expectedResult: Auth.RefreshToken.Response = {
      idToken,
    };

    const result = await service({
      body,
    });
    expect(result).toEqual(expectedResult);
    validateFunctionCall(mockIdentityService.functions.refreshToken, body);
  });

  it('should throw error if unable to refresh token', async () => {
    mockIdentityService.functions.refreshToken.mockRejectedValue('This is a cognito error');

    await service({
      body,
    }).catch(validateError('Error while getting refresh token', 500));
    validateFunctionCall(mockIdentityService.functions.refreshToken, body);
    expect.assertions(3);
  });
});
