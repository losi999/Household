import { addUserToGroupServiceFactory, IAddUserToGroup } from '@household/api/functions/add-user-to-group/add-user-to-group.service';
import { IIdentityService } from '@household/shared/services/identity-service';
import { Mock, createMockService, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { UserType } from '@household/shared/enums';

describe('Add user to group service', () => {
  let service: IAddUserToGroup;
  let mockIdentityService: Mock<IIdentityService>;

  beforeEach(() => {
    mockIdentityService = createMockService<IIdentityService>('addUserToGroup');

    service = addUserToGroupServiceFactory(mockIdentityService.service);
  });
  const email = 'user@email.com';
  const group = UserType.Editor;

  it('should return', async () => {
    mockIdentityService.functions.addUserToGroup.mockResolvedValue(undefined);

    await service({
      group,
      email,
    });
    validateFunctionCall(mockIdentityService.functions.addUserToGroup, email, group);
  });

  it('should throw error if unable to add user to group', async () => {
    mockIdentityService.functions.addUserToGroup.mockRejectedValue('This is a cognito error');

    await service({
      group,
      email,
    }).catch(validateError('Error while adding user to group in cognito', 500));
    validateFunctionCall(mockIdentityService.functions.addUserToGroup, email, group);
    expect.assertions(3);
  });
});
