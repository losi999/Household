import { MockBusinessService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { default as handler } from '@household/api/functions/get-project/get-project.handler';
import { IGetProjectService } from '@household/api/functions/get-project/get-project.service';
import { createProjectId, createProjectResponse } from '@household/shared/common/test-data-factory';

describe('Get project handler', () => {
  let mockGetProjectService: MockBusinessService<IGetProjectService>;
  let handlerFunction: ReturnType<typeof handler>;

  beforeEach(() => {
    mockGetProjectService = jest.fn();
    handlerFunction = handler(mockGetProjectService);
  });

  const projectId = createProjectId();
  const project = createProjectResponse();
  const handlerEvent = {
    pathParameters: {
      projectId,
    } as AWSLambda.APIGatewayProxyEventPathParameters,
  } as AWSLambda.APIGatewayProxyEvent;

  it('should handle business service error', async () => {
    const statusCode = 418;
    const message = 'This is an error';
    mockGetProjectService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockGetProjectService, {
      projectId,
    });
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
    expect.assertions(3);
  });

  it('should respond with success', async () => {
    mockGetProjectService.mockResolvedValue(project);

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockGetProjectService, {
      projectId,
    });
    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.body)).toEqual(project);
    expect.assertions(3);
  });
});
