import { listUsersServiceFactory, IListUsersService } from '@household/api/functions/list-users/list-users.service';
import { IIdentityService } from '@household/shared/services/identity-service';
import { Mock, createMockService, validateError, validateNthFunctionCall } from '@household/shared/common/unit-testing';
import { createUserResponse } from '@household/shared/common/test-data-factory';
import { UserType } from '@household/shared/enums';

describe('List users service', () => {
  let service: IListUsersService;
  let mockIdentityService: Mock<IIdentityService>;

  beforeEach(() => {
    mockIdentityService = createMockService<IIdentityService>('listUsers', 'listUsersByGroupName');

    service = listUsersServiceFactory(mockIdentityService.service);
  });
  const editorEmail = 'editor@email.com';
  const viewerEmail = 'viewer@email.com';
  const hairdresserEmail = 'hairdresser@email.com';
  const status = 'CONFIRMED';
  const editorUser = {
    UserStatus: status,
    Attributes: [
      {
        Name: 'email',
        Value: editorEmail,
      },
    ],
  };
  const viewerUser = {
    UserStatus: status,
    Attributes: [
      {
        Name: 'email',
        Value: viewerEmail,
      },
    ],
  };
  const hairdresserUser = {
    UserStatus: status,
    Attributes: [
      {
        Name: 'email',
        Value: hairdresserEmail,
      },
    ],
  };

  it('should return', async () => {
    mockIdentityService.functions.listUsers.mockResolvedValue({
      Users: [
        editorUser,
        viewerUser,
        hairdresserUser,
      ],
    });
    mockIdentityService.functions.listUsersByGroupName.mockResolvedValueOnce({
      Users: [editorUser],
    });
    mockIdentityService.functions.listUsersByGroupName.mockResolvedValueOnce({
      Users: [hairdresserUser],
    });

    const result = await service();
    expect(result).toEqual([
      createUserResponse({
        email: editorEmail,
        status,
        groups: [UserType.Editor],
      }),
      createUserResponse({
        email: hairdresserEmail,
        status,
        groups: [UserType.Hairdresser],
      }),
      createUserResponse({
        email: viewerEmail,
        status,
        groups: [],
      }),
    ]);
    expect(mockIdentityService.functions.listUsers).toHaveBeenCalledTimes(1);
    validateNthFunctionCall(mockIdentityService.functions.listUsersByGroupName, 1, UserType.Editor);
    validateNthFunctionCall(mockIdentityService.functions.listUsersByGroupName, 2, UserType.Hairdresser);
    expect.assertions(4);
  });

  it('should throw error if unable to list users', async () => {
    mockIdentityService.functions.listUsers.mockRejectedValue('This is a cognito error');

    await service().catch(validateError('Error while listing users from cognito', 500));
    expect(mockIdentityService.functions.listUsers).toHaveBeenCalledTimes(1);
    expect.assertions(3);
  });

  it('should throw error if unable to list users by group', async () => {
    mockIdentityService.functions.listUsers.mockResolvedValue({
      Users: [
        editorUser,
        viewerUser,
        hairdresserUser,
      ],
    });
    mockIdentityService.functions.listUsersByGroupName.mockRejectedValue('this is a cognito error');

    await service().catch(validateError('Error while listing users by group from cognito', 500));
    expect(mockIdentityService.functions.listUsers).toHaveBeenCalledTimes(1);
    validateNthFunctionCall(mockIdentityService.functions.listUsersByGroupName, 1, UserType.Editor);
    validateNthFunctionCall(mockIdentityService.functions.listUsersByGroupName, 2, UserType.Hairdresser);
    expect.assertions(5);
  });
});
