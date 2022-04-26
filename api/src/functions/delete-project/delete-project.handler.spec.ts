import { MockBusinessService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { default as handler } from '@household/api/functions/delete-project/delete-project.handler';
import { IDeleteProjectService } from '@household/api/functions/delete-project/delete-project.service';
import { createProjectId } from '@household/shared/common/test-data-factory';

describe('Delete project handler', () => {
  let mockDeleteProjectService: MockBusinessService<IDeleteProjectService>;
  let handlerFunction: ReturnType<typeof handler>;

  beforeEach(() => {
    mockDeleteProjectService = jest.fn();
    handlerFunction = handler(mockDeleteProjectService);
  });

  const projectId = createProjectId();
  const handlerEvent = {
    pathParameters: {
      projectId,
    } as AWSLambda.APIGatewayProxyEventPathParameters,
  } as AWSLambda.APIGatewayProxyEvent;

  it('should handle business service error', async () => {
    const statusCode = 418;
    const message = 'This is an error';
    mockDeleteProjectService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockDeleteProjectService, {
      projectId,
    });
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
    expect.assertions(3);
  });

  it('should respond with success', async () => {
    mockDeleteProjectService.mockResolvedValue(undefined);

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockDeleteProjectService, {
      projectId,
    });
    expect(response.statusCode).toEqual(204);
    expect.assertions(2);
  });
});
