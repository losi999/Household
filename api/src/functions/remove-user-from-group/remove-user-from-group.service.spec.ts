import { removeUserFromGroupServiceFactory, IRemoveUserFromGroup } from '@household/api/functions/remove-user-from-group/remove-user-from-group.service';
import { IIdentityService } from '@household/shared/services/identity-service';
import { Mock, createMockService, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { UserType } from '@household/shared/enums';

describe('Remove user from group service', () => {
  let service: IRemoveUserFromGroup;
  let mockIdentityService: Mock<IIdentityService>;

  beforeEach(() => {
    mockIdentityService = createMockService<IIdentityService>('removeUserFromGroup');

    service = removeUserFromGroupServiceFactory(mockIdentityService.service);
  });
  const email = 'user@email.com';
  const group = UserType.Editor;

  it('should return', async () => {
    mockIdentityService.functions.removeUserFromGroup.mockResolvedValue(undefined);

    await service({
      group,
      email,
    });
    validateFunctionCall(mockIdentityService.functions.removeUserFromGroup, email, group);
    expect.assertions(1);
  });

  it('should throw error if unable to remove user from group', async () => {
    mockIdentityService.functions.removeUserFromGroup.mockRejectedValue('This is a cognito error');

    await service({
      group,
      email,
    }).catch(validateError('Error while removing user from group in cognito', 500));
    validateFunctionCall(mockIdentityService.functions.removeUserFromGroup, email, group);
    expect.assertions(3);
  });
});
