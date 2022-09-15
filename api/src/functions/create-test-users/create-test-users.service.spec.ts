// import { ICreateTestUsersService, createTestUsersServiceFactory } from '@household/api/functions/create-test-users/create-test-users-service';
// import { IIdentityService } from '@household/shared/services/identity-service';
// import { Mock, createMockService, validateError } from '@household/shared/common/unit-testing';

// describe('Create test users service', () => {
//   let service: ICreateTestUsersService;
//   let mockIdentityService: Mock<IIdentityService>;
//   const testUserPassword = 'password';

//   beforeEach(() => {
//     mockIdentityService = createMockService('register');

//     service = createTestUsersServiceFactory(mockIdentityService.service);

//     process.env.TEST_USER_PASSWORD = testUserPassword;
//   });

//   afterEach(() => {
//     process.env.TEST_USER_PASSWORD = undefined;
//   });

//   it('should create a specific number of test users', async () => {
//     const numberOfAdmins = 2;
//     const numberOfPlayers = 3;

//     mockIdentityService.functions.register.mockResolvedValue(undefined);

//     await service({
//       numberOfAdmins,
//       numberOfPlayers,
//     });
//     expect(mockIdentityService.functions.register).toHaveBeenCalledTimes(numberOfAdmins + numberOfPlayers);
//     expect(mockIdentityService.functions.register).toHaveBeenNthCalledWith(1, {
//       email: 'losonczil+admin1@gmail.com',
//       password: testUserPassword,
//       displayName: 'admin1',
//     }, 'admin');
//     expect(mockIdentityService.functions.register).toHaveBeenNthCalledWith(2, {
//       email: 'losonczil+admin2@gmail.com',
//       password: testUserPassword,
//       displayName: 'admin2',
//     }, 'admin');
//     expect(mockIdentityService.functions.register).toHaveBeenNthCalledWith(3, {
//       email: 'losonczil+player1@gmail.com',
//       password: testUserPassword,
//       displayName: 'player1',
//     }, 'player');
//     expect(mockIdentityService.functions.register).toHaveBeenNthCalledWith(4, {
//       email: 'losonczil+player2@gmail.com',
//       password: testUserPassword,
//       displayName: 'player2',
//     }, 'player');
//     expect(mockIdentityService.functions.register).toHaveBeenNthCalledWith(5, {
//       email: 'losonczil+player3@gmail.com',
//       password: testUserPassword,
//       displayName: 'player3',
//     }, 'player');
//   });

//   it('should handler error if register throws "UsernameExistsException" error', async () => {

//     const numberOfAdmins = 2;
//     const numberOfPlayers = 3;

//     mockIdentityService.functions.register.mockRejectedValue({
//       code: 'UsernameExistsException',
//     });

//     await service({
//       numberOfAdmins,
//       numberOfPlayers,
//     });
//     expect(mockIdentityService.functions.register).toHaveBeenCalledTimes(numberOfAdmins + numberOfPlayers);
//     expect.assertions(1);
//   });

//   it('should throw error if register NOT throws "UsernameExistsException" error', async () => {

//     const numberOfAdmins = 2;
//     const numberOfPlayers = 3;

//     const message = 'This is a cognito error';
//     mockIdentityService.functions.register.mockRejectedValue({
//       message,
//       code: 'NOTUsernameExistsException',
//     });

//     await service({
//       numberOfAdmins,
//       numberOfPlayers,
//     }).catch(validateError(message));
//     expect(mockIdentityService.functions.register).toHaveBeenCalledTimes(numberOfAdmins + numberOfPlayers);
//     expect.assertions(2);
//   });
// });
