import { MockBusinessService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { default as handler } from '@household/api/functions/create-upload-url/create-upload-url.handler';
import { ICreateUploadUrlService } from '@household/api/functions/create-upload-url/create-upload-url.service';
import { createFileId, createFileRequest } from '@household/shared/common/test-data-factory';
import { headerExpiresIn } from '@household/shared/constants';

describe('Create upload url handler', () => {
  let mockCreateUploadUrlService: MockBusinessService<ICreateUploadUrlService>;
  let handlerFunction: ReturnType<typeof handler>;

  beforeEach(() => {
    mockCreateUploadUrlService = jest.fn();
    handlerFunction = handler(mockCreateUploadUrlService);
  });

  const body = createFileRequest();
  const expiresIn = 3600;
  const handlerEvent = {
    body: JSON.stringify(body),
    headers: {
      [headerExpiresIn]: `${expiresIn}`,
    } as AWSLambda.APIGatewayProxyEventHeaders,
  } as AWSLambda.APIGatewayProxyEvent;
  const url = 'https://url-to.upload.com';
  const fileId = createFileId();

  it('should handle business service error', async () => {

    const statusCode = 418;
    const message = 'This is an error';
    mockCreateUploadUrlService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockCreateUploadUrlService, {
      body,
      expiresIn,
    });
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
    expect.assertions(3);
  });

  it('should respond with success', async () => {
    mockCreateUploadUrlService.mockResolvedValue({
      fileId,
      url,
    });

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockCreateUploadUrlService, {
      body,
      expiresIn,
    });
    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.body).url).toEqual(url);
    expect(JSON.parse(response.body).fileId).toEqual(fileId);
    expect.assertions(4);
  });
});
