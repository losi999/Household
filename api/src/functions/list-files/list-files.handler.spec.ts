import { MockBusinessService } from '@household/shared/common/unit-testing';
import { default as handler } from '@household/api/functions/list-files/list-files.handler';
import { IListFilesService } from '@household/api/functions/list-files/list-files.service';
import { createFileResponse } from '@household/shared/common/test-data-factory';

describe('List files handler', () => {
  let mockListFilesService: MockBusinessService<IListFilesService>;
  let handlerFunction: ReturnType<typeof handler>;

  beforeEach(() => {
    mockListFilesService = jest.fn();
    handlerFunction = handler(mockListFilesService);
  });

  const files = [createFileResponse()];
  const handlerEvent = {} as AWSLambda.APIGatewayProxyEvent;

  it('should handle business service error', async () => {
    const statusCode = 418;
    const message = 'This is an error';
    mockListFilesService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    expect(mockListFilesService).toHaveBeenCalled();
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
    expect.assertions(3);
  });

  it('should respond with success', async () => {
    mockListFilesService.mockResolvedValue(files);

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    expect(mockListFilesService).toHaveBeenCalled();
    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.body)).toEqual(files);
    expect.assertions(3);
  });
});
