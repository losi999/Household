import { confirmUserServiceFactory, IConfirmUserService } from '@household/api/functions/confirm-user/confirm-user.service';
import { IIdentityService } from '@household/shared/services/identity-service';
import { MockService, createMockService, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { Requests } from '@household/shared/types/requests';

describe('Confirm user service', () => {
  let service: IConfirmUserService;
  let mockIdentityService: MockService<IIdentityService>;

  beforeEach(() => {
    mockIdentityService = createMockService<IIdentityService>('confirmUser');

    service = confirmUserServiceFactory(mockIdentityService.service);
  });
  const email = 'user@email.com';
  const password = 'password';
  const temporaryPassword = 'tempPassword';
  const body = {
    password,
    temporaryPassword,
  } as Requests.ConfirmUser;

  it('should return', async () => {
    mockIdentityService.functions.confirmUser.mockResolvedValue(undefined);

    await service({
      body,
      email,
    });
    validateFunctionCall(mockIdentityService.functions.confirmUser, {
      email,
      temporaryPassword,
      password,
    });
  });

  it('should throw error if unable to confirm user', async () => {
    mockIdentityService.functions.confirmUser.mockRejectedValue('This is a cognito error');

    await service({
      body,
      email,
    }).catch(validateError('Error while confirming user in cognito', 500));
    validateFunctionCall(mockIdentityService.functions.confirmUser, {
      email,
      temporaryPassword,
      password,
    });
    expect.assertions(3);
  });
});
