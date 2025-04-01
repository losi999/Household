import { MockBusinessService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { default as handler } from '@household/api/functions/delete-file/delete-file.handler';
import { IDeleteFileService } from '@household/api/functions/delete-file/delete-file.service';
import { createFileId } from '@household/shared/common/test-data-factory';

describe('Delete file handler', () => {
  let mockDeleteFileService: MockBusinessService<IDeleteFileService>;
  let handlerFunction: ReturnType<typeof handler>;

  beforeEach(() => {
    mockDeleteFileService = jest.fn();
    handlerFunction = handler(mockDeleteFileService);
  });

  const fileId = createFileId();
  const handlerEvent = {
    pathParameters: {
      fileId,
    } as AWSLambda.APIGatewayProxyEventPathParameters,
  } as AWSLambda.APIGatewayProxyEvent;

  it('should handle business service error', async () => {
    const statusCode = 418;
    const message = 'This is an error';
    mockDeleteFileService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockDeleteFileService, {
      fileId,
    });
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
    expect.assertions(3);
  });

  it('should respond with success', async () => {
    mockDeleteFileService.mockResolvedValue(undefined);

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockDeleteFileService, {
      fileId,
    });
    expect(response.statusCode).toEqual(204);
    expect.assertions(2);
  });
});
