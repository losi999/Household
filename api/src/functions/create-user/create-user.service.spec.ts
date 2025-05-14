import { createUserServiceFactory, ICreateUserService } from '@household/api/functions/create-user/create-user.service';
import { IIdentityService } from '@household/shared/services/identity-service';
import { Mock, createMockService, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { User } from '@household/shared/types/types';
import { UserType } from '@household/shared/enums';

describe('Create user service', () => {
  let service: ICreateUserService;
  let mockIdentityService: Mock<IIdentityService>;

  beforeEach(() => {
    mockIdentityService = createMockService<IIdentityService>('createUser');

    service = createUserServiceFactory(mockIdentityService.service);
  });
  const email = 'user@email.com';
  const body = {
    email,
  } as User.Request;

  it('should return', async () => {

    mockIdentityService.functions.createUser.mockResolvedValue(undefined);

    await service({
      body,
      suppressEmail: true,
    });
    validateFunctionCall(mockIdentityService.functions.createUser, body, UserType.Viewer, true);
  });

  it('should throw error if unable to create user', async () => {
    mockIdentityService.functions.createUser.mockRejectedValue('This is a cognito error');

    await service({
      body,
      suppressEmail: undefined,
    }).catch(validateError('Error while creating user in cognito', 500));
    validateFunctionCall(mockIdentityService.functions.createUser, body, UserType.Viewer, undefined);
    expect.assertions(3);
  });
});
