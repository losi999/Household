import { IForgotPasswordService, forgotPasswordServiceFactory } from '@household/api/functions/forgot-password/forgot-password-service';
import { IIdentityService } from '@household/shared/services/identity-service';
import { Mock, createMockService, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';

describe('Forgot password service', () => {
  let service: IForgotPasswordService;
  let mockIdentityService: Mock<IIdentityService>;

  beforeEach(() => {
    mockIdentityService = createMockService<IIdentityService>('forgotPassword');

    service = forgotPasswordServiceFactory(mockIdentityService.service);
  });

  const email = 'email@email.com';

  it('should return with login credentials', async () => {
    mockIdentityService.functions.forgotPassword.mockResolvedValue(undefined);
    await service({
      body: {
        email,
      },
    });
    validateFunctionCall(mockIdentityService.functions.forgotPassword, {
      email,
    });
  });

  it('should throw error if unable to forgot password', async () => {
    mockIdentityService.functions.forgotPassword.mockRejectedValue('This is a cognito error');

    await service({
      body: {
        email,
      },
    }).catch(validateError('Error while resetting password', 500));
    validateFunctionCall(mockIdentityService.functions.forgotPassword, {
      email,
    });
    expect.assertions(3);
  });
});
