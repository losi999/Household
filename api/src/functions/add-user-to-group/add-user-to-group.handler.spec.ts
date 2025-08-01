import { default as handler } from '@household/api/functions/add-user-to-group/add-user-to-group.handler';
import { IAddUserToGroup } from '@household/api/functions/add-user-to-group/add-user-to-group.service';
import { MockBusinessService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { UserType } from '@household/shared/enums';

describe('Add user to group handler', () => {
  let mockAddUserToGroupService: MockBusinessService<IAddUserToGroup>;
  let apiHandler: ReturnType<typeof handler>;

  beforeEach(() => {
    mockAddUserToGroupService = jest.fn();

    apiHandler = handler(mockAddUserToGroupService);
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
    mockAddUserToGroupService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await apiHandler(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockAddUserToGroupService, {
      group,
      email,
    });
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
    expect.assertions(3);
  });

  it('should respond with success if service executes successfully', async () => {
    mockAddUserToGroupService.mockResolvedValue(undefined);

    const response = await apiHandler(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockAddUserToGroupService, {
      group,
      email,
    });
    expect(response.statusCode).toEqual(204);
    expect.assertions(2);
  });
});
