import { MockBusinessService } from '@household/shared/common/unit-testing';
import { default as handler } from '@household/api/functions/list-recipients/list-recipients.handler';
import { IListRecipientsService } from '@household/api/functions/list-recipients/list-recipients.service';
import { createRecipientResponse } from '@household/shared/common/test-data-factory';

describe('List recipients handler', () => {
  let mockListRecipientsService: MockBusinessService<IListRecipientsService>;
  let handlerFunction: ReturnType<typeof handler>;

  beforeEach(() => {
    mockListRecipientsService = jest.fn();
    handlerFunction = handler(mockListRecipientsService);
  });

  const recipients = [createRecipientResponse()];
  const handlerEvent = {} as AWSLambda.APIGatewayProxyEvent;

  it('should handle business service error', async () => {
    const statusCode = 418;
    const message = 'This is an error';
    mockListRecipientsService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    expect(mockListRecipientsService).toHaveBeenCalled();
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
    expect.assertions(3);
  });

  it('should respond with success', async () => {
    mockListRecipientsService.mockResolvedValue(recipients);

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    expect(mockListRecipientsService).toHaveBeenCalled();
    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.body)).toEqual(recipients);
    expect.assertions(3);
  });
});
