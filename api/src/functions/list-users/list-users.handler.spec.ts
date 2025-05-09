import { default as handler } from '@household/api/functions/list-users/list-users.handler';
import { IListUsersService } from '@household/api/functions/list-users/list-users.service';
import { createUserResponse } from '@household/shared/common/test-data-factory';
import { MockBusinessService } from '@household/shared/common/unit-testing';

describe('List users handler', () => {
  let mockListUsersService: MockBusinessService<IListUsersService>;
  let apiHandler: ReturnType<typeof handler>;

  beforeEach(() => {
    mockListUsersService = jest.fn();

    apiHandler = handler(mockListUsersService);
  });

  const returnedUser = createUserResponse();

  it('should respond with error if service throws error', async () => {
    const statusCode = 418;
    const message = 'This is an error';
    mockListUsersService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await apiHandler(undefined, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    expect(mockListUsersService).toHaveBeenCalledTimes(1);
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
    expect.assertions(3);
  });

  it('should respond with success if users are returned', async () => {
    mockListUsersService.mockResolvedValue([returnedUser]);

    const response = await apiHandler(undefined, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    expect(mockListUsersService).toHaveBeenCalledTimes(1);
    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.body)).toEqual([returnedUser]);
    expect.assertions(3);
  });
});
