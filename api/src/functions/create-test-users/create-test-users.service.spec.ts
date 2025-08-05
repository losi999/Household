import { ICreateTestUsersService, createTestUsersServiceFactory } from '@household/api/functions/create-test-users/create-test-users.service';
import { IIdentityService } from '@household/shared/services/identity-service';
import { Mock, createMockService, validateError, validateNthFunctionCall } from '@household/shared/common/unit-testing';
import { UserType } from '@household/shared/enums';

describe('Create test users service', () => {
  let service: ICreateTestUsersService;
  let mockIdentityService: Mock<IIdentityService>;
  const testUserPassword = 'password';

  beforeEach(() => {
    mockIdentityService = createMockService('createUser');

    service = createTestUsersServiceFactory(mockIdentityService.service);

    process.env.TEST_USER_PASSWORD = testUserPassword;
  });

  afterEach(() => {
    process.env.TEST_USER_PASSWORD = undefined;
  });

  const userTypes = Object.values(UserType);

  it('should create a specific number of test users', async () => {
    mockIdentityService.functions.createUser.mockResolvedValue(undefined);

    await service();
    expect(mockIdentityService.functions.createUser).toHaveBeenCalledTimes(userTypes.length + 1);
    userTypes.forEach((userType, index) => {
      validateNthFunctionCall(mockIdentityService.functions.createUser, index + 1, {
        email: `losonczil+${userType}@gmail.com`,
        password: testUserPassword,
      }, userType);
    });
    validateNthFunctionCall(mockIdentityService.functions.createUser, userTypes.length + 1, {
      email: 'losonczil+viewer@gmail.com',
      password: testUserPassword,
    }, undefined);
  });

  it('should handler error if createUser throws "UsernameExistsException" error', async () => {
    mockIdentityService.functions.createUser.mockRejectedValue({
      name: 'UsernameExistsException',
    });

    await service();
    expect(mockIdentityService.functions.createUser).toHaveBeenCalledTimes(userTypes.length + 1);
    expect.assertions(1);
  });

  it('should throw error if createUser NOT throws "UsernameExistsException" error', async () => {
    const message = 'This is a cognito error';
    mockIdentityService.functions.createUser.mockRejectedValue({
      message,
      name: 'NOTUsernameExistsException',
    });

    await service().catch(validateError(message));
    expect(mockIdentityService.functions.createUser).toHaveBeenCalledTimes(userTypes.length + 1);
    expect.assertions(2);
  });
});
