// import { default as handler } from '@household/api/functions/create-test-users/create-test-users-handler';
// import { validateError } from '@household/shared/common/unit-testing';

// describe('Create test users handler', () => {
//   let handlerFunction: ReturnType<typeof handler>;
//   let mockCreateTestUsersService: jest.Mock;

//   beforeEach(() => {
//     mockCreateTestUsersService = jest.fn();

//     handlerFunction = handler(mockCreateTestUsersService);
//   });

//   it('should throw error if createTestUsers throws error', async () => {
//     const message = 'This is an error';
//     mockCreateTestUsersService.mockRejectedValue({
//       message,
//     });

//     await (handlerFunction(undefined, undefined, undefined) as Promise<unknown>).catch(validateError(message));
//   });

//   it('should return undefined if createTestUsers executes successfully', async () => {
//     mockCreateTestUsersService.mockResolvedValue(undefined);

//     const response = await handlerFunction(undefined, undefined, undefined);

//     expect(response).toBeUndefined();
//   });
// });
