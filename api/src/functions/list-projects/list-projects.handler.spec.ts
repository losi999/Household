import { MockBusinessService } from '@household/shared/common/unit-testing';
import { default as handler } from '@household/api/functions/list-projects/list-projects.handler';
import { IListProjectsService } from '@household/api/functions/list-projects/list-projects.service';
import { createProjectResponse } from '@household/shared/common/test-data-factory';

describe('List projects handler', () => {
  let mockListProjectsService: MockBusinessService<IListProjectsService>;
  let handlerFunction: ReturnType<typeof handler>;

  beforeEach(() => {
    mockListProjectsService = jest.fn();
    handlerFunction = handler(mockListProjectsService);
  });

  const projects = [createProjectResponse()];
  const handlerEvent = {} as AWSLambda.APIGatewayProxyEvent;

  it('should handle business service error', async () => {
    const statusCode = 418;
    const message = 'This is an error';
    mockListProjectsService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    expect(mockListProjectsService).toHaveBeenCalled();
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
    expect.assertions(3);
  });

  it('should respond with success', async () => {
    mockListProjectsService.mockResolvedValue(projects);

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    expect(mockListProjectsService).toHaveBeenCalled();
    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.body)).toEqual(projects);
    expect.assertions(3);
  });
});
