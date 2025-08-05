import { IConfirmForgotPasswordService, confirmForgotPasswordServiceFactory } from '@household/api/functions/confirm-forgot-password/confirm-forgot-password-service';
import { IIdentityService } from '@household/shared/services/identity-service';
import { Mock, createMockService, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { createConfirmForgotPasswordRequest } from '@household/shared/common/test-data-factory';

describe('Confirm forgot password service', () => {
  let service: IConfirmForgotPasswordService;
  let mockIdentityService: Mock<IIdentityService>;

  beforeEach(() => {
    mockIdentityService = createMockService<IIdentityService>('confirmForgotPassword');

    service = confirmForgotPasswordServiceFactory(mockIdentityService.service);
  });

  const body = createConfirmForgotPasswordRequest();
  const email = 'email@email.com';

  it('should return', async () => {
    mockIdentityService.functions.confirmForgotPassword.mockResolvedValue(undefined);
    await service({
      body,
      email,
    });
    validateFunctionCall(mockIdentityService.functions.confirmForgotPassword, {
      ...body,
      email,
    });
  });

  it('should throw error if unable to confirm forgot password', async () => {
    mockIdentityService.functions.confirmForgotPassword.mockRejectedValue('This is a cognito error');

    await service({
      body,
      email,
    }).catch(validateError('Error while confirming forgot password in cognito', 500));
    validateFunctionCall(mockIdentityService.functions.confirmForgotPassword, {
      ...body,
      email,
    });
    expect.assertions(3);
  });
});
