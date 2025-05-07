import { deleteUserServiceFactory, IDeleteUserService } from '@household/api/functions/delete-user/delete-user.service';
import { IIdentityService } from '@household/shared/services/identity-service';
import { Mock, createMockService, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';

describe('Delete user service', () => {
  let service: IDeleteUserService;
  let mockIdentityService: Mock<IIdentityService>;

  beforeEach(() => {
    mockIdentityService = createMockService<IIdentityService>('deleteUser');

    service = deleteUserServiceFactory(mockIdentityService.service);
  });

  const email = 'user@email.com';

  it('should return', async () => {

    mockIdentityService.functions.deleteUser.mockResolvedValue(undefined);

    await service({
      email,
    });
    validateFunctionCall(mockIdentityService.functions.deleteUser, {
      email,
    });
  });

  it('should throw error if unable to delete user', async () => {
    mockIdentityService.functions.deleteUser.mockRejectedValue({
      message: 'This is a cognito error',
    });

    await service({
      email,
    }).catch(validateError('This is a cognito error', 500));
    validateFunctionCall(mockIdentityService.functions.deleteUser, {
      email,
    });
    expect.assertions(3);
  });
});
