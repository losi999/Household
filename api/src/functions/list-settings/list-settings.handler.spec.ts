import { MockBusinessService } from '@household/shared/common/unit-testing';
import { default as handler } from '@household/api/functions/list-settings/list-settings.handler';
import { IListSettingsService } from '@household/api/functions/list-settings/list-settings.service';
import { createSettingResponse } from '@household/shared/common/test-data-factory';

describe('List settings handler', () => {
  let mockListSettingsService: MockBusinessService<IListSettingsService>;
  let handlerFunction: ReturnType<typeof handler>;

  beforeEach(() => {
    mockListSettingsService = jest.fn();
    handlerFunction = handler(mockListSettingsService);
  });

  const settings = [createSettingResponse()];
  const handlerEvent = {} as AWSLambda.APIGatewayProxyEvent;

  it('should handle business service error', async () => {
    const statusCode = 418;
    const message = 'This is an error';
    mockListSettingsService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    expect(mockListSettingsService).toHaveBeenCalled();
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
    expect.assertions(3);
  });

  it('should respond with success', async () => {
    mockListSettingsService.mockResolvedValue(settings);

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    expect(mockListSettingsService).toHaveBeenCalled();
    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.body)).toEqual(settings);
    expect.assertions(3);
  });
});
