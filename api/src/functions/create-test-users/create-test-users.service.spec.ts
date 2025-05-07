import { ICreateTestUsersService, createTestUsersServiceFactory } from '@household/api/functions/create-test-users/create-test-users.service';
import { IIdentityService } from '@household/shared/services/identity-service';
import { Mock, createMockService, validateError } from '@household/shared/common/unit-testing';

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

  it('should create a specific number of test users', async () => {
    const numberOfAdmins = 2;

    mockIdentityService.functions.createUser.mockResolvedValue(undefined);

    await service({
      numberOfAdmins,
    });
    expect(mockIdentityService.functions.createUser).toHaveBeenCalledTimes(numberOfAdmins);
    expect(mockIdentityService.functions.createUser).toHaveBeenNthCalledWith(1, {
      email: 'losonczil+1@gmail.com',
      password: testUserPassword,
    });
    expect(mockIdentityService.functions.createUser).toHaveBeenNthCalledWith(2, {
      email: 'losonczil+2@gmail.com',
      password: testUserPassword,
    });
  });

  it('should handler error if createUser throws "UsernameExistsException" error', async () => {

    const numberOfAdmins = 2;

    mockIdentityService.functions.createUser.mockRejectedValue({
      name: 'UsernameExistsException',
    });

    await service({
      numberOfAdmins,
    });
    expect(mockIdentityService.functions.createUser).toHaveBeenCalledTimes(numberOfAdmins);
    expect.assertions(1);
  });

  it('should throw error if createUser NOT throws "UsernameExistsException" error', async () => {
    const numberOfAdmins = 2;

    const message = 'This is a cognito error';
    mockIdentityService.functions.createUser.mockRejectedValue({
      message,
      name: 'NOTUsernameExistsException',
    });

    await service({
      numberOfAdmins,
    }).catch(validateError(message));
    expect(mockIdentityService.functions.createUser).toHaveBeenCalledTimes(numberOfAdmins);
    expect.assertions(2);
  });
});
