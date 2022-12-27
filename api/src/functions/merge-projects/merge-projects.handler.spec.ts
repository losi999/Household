import { MockBusinessService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { default as handler } from '@household/api/functions/merge-projects/merge-projects.handler';
import { IMergeProjectsService } from '@household/api/functions/merge-projects/merge-projects.service';
import { createProjectId } from '@household/shared/common/test-data-factory';

describe('Merge projects handler', () => {
  let mockMergeProjectsService: MockBusinessService<IMergeProjectsService>;
  let handlerFunction: ReturnType<typeof handler>;

  beforeEach(() => {
    mockMergeProjectsService = jest.fn();
    handlerFunction = handler(mockMergeProjectsService);
  });

  const projectId = createProjectId();
  const body = [createProjectId()];
  const handlerEvent = {
    body: JSON.stringify(body),
    pathParameters: {
      projectId,
    } as AWSLambda.APIGatewayProxyEventPathParameters,
  } as AWSLambda.APIGatewayProxyEvent;

  it('should handle business service error', async () => {
    const statusCode = 418;
    const message = 'This is an error';
    mockMergeProjectsService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockMergeProjectsService, {
      projectId,
      body,
    });
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
    expect.assertions(3);
  });

  it('should respond with success', async () => {
    mockMergeProjectsService.mockResolvedValue(undefined);

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockMergeProjectsService, {
      projectId,
      body,
    });
    expect(response.statusCode).toEqual(201);
    expect(JSON.parse(response.body).projectId).toEqual(projectId);
    expect.assertions(3);
  });
});
