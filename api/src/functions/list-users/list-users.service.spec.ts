import { listUsersServiceFactory, IListUsersService } from '@household/api/functions/list-users/list-users.service';
import { IIdentityService } from '@household/shared/services/identity-service';
import { Mock, createMockService, validateError } from '@household/shared/common/unit-testing';
import { createUserResponse } from '@household/shared/common/test-data-factory';

describe('List users service', () => {
  let service: IListUsersService;
  let mockIdentityService: Mock<IIdentityService>;

  beforeEach(() => {
    mockIdentityService = createMockService<IIdentityService>('listUsers');

    service = listUsersServiceFactory(mockIdentityService.service);
  });
  const email = 'user@email.com';
  const status = 'CONFIRMED';

  it('should return', async () => {
    mockIdentityService.functions.listUsers.mockResolvedValue({
      Users: [
        {
          UserStatus: status,
          Attributes: [
            {
              Name: 'email',
              Value: email,
            },
          ],
        },
      ],
    });

    const result = await service();
    expect(result).toEqual([
      createUserResponse({
        email,
        status,
      }),
    ]);
    expect(mockIdentityService.functions.listUsers).toHaveBeenCalledTimes(1);
    expect.assertions(2);
  });

  it('should throw error if unable to list users', async () => {
    mockIdentityService.functions.listUsers.mockRejectedValue({
      message: 'This is a cognito error',
    });

    await service().catch(validateError('This is a cognito error', 500));
    expect(mockIdentityService.functions.listUsers).toHaveBeenCalledTimes(1);
    expect.assertions(3);
  });
});
