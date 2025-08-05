import { default as handler } from '@household/api/functions/remove-user-from-group/remove-user-from-group.handler';
import { IRemoveUserFromGroup } from '@household/api/functions/remove-user-from-group/remove-user-from-group.service';
import { MockBusinessService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { UserType } from '@household/shared/enums';

describe('Confirm user handler', () => {
  let mockRemoveUserFromGroupService: MockBusinessService<IRemoveUserFromGroup>;
  let apiHandler: ReturnType<typeof handler>;

  beforeEach(() => {
    mockRemoveUserFromGroupService = jest.fn();

    apiHandler = handler(mockRemoveUserFromGroupService);
  });

  const email = 'user@email.com';
  const group = UserType.Editor;
  const handlerEvent = {
    pathParameters: {
      email,
      group,
    } as AWSLambda.APIGatewayProxyEventPathParameters,
  } as AWSLambda.APIGatewayProxyEvent;

  it('should respond with error if service throws error', async () => {
    const statusCode = 418;
    const message = 'This is an error';
    mockRemoveUserFromGroupService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await apiHandler(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockRemoveUserFromGroupService, {
      group,
      email,
    });
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
    expect.assertions(3);
  });

  it('should respond with success if service executes successfully', async () => {
    mockRemoveUserFromGroupService.mockResolvedValue(undefined);

    const response = await apiHandler(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockRemoveUserFromGroupService, {
      group,
      email,
    });
    expect(response.statusCode).toEqual(204);
    expect.assertions(2);
  });
});
