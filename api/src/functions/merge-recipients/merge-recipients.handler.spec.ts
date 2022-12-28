import { MockBusinessService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { default as handler } from '@household/api/functions/merge-recipients/merge-recipients.handler';
import { IMergeRecipientsService } from '@household/api/functions/merge-recipients/merge-recipients.service';
import { createRecipientId } from '@household/shared/common/test-data-factory';

describe('Merge recipients handler', () => {
  let mockMergeRecipientsService: MockBusinessService<IMergeRecipientsService>;
  let handlerFunction: ReturnType<typeof handler>;

  beforeEach(() => {
    mockMergeRecipientsService = jest.fn();
    handlerFunction = handler(mockMergeRecipientsService);
  });

  const recipientId = createRecipientId();
  const body = [createRecipientId()];
  const handlerEvent = {
    body: JSON.stringify(body),
    pathParameters: {
      recipientId,
    } as AWSLambda.APIGatewayProxyEventPathParameters,
  } as AWSLambda.APIGatewayProxyEvent;

  it('should handle business service error', async () => {
    const statusCode = 418;
    const message = 'This is an error';
    mockMergeRecipientsService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockMergeRecipientsService, {
      recipientId,
      body,
    });
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
    expect.assertions(3);
  });

  it('should respond with success', async () => {
    mockMergeRecipientsService.mockResolvedValue(undefined);

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockMergeRecipientsService, {
      recipientId,
      body,
    });
    expect(response.statusCode).toEqual(201);
    expect(JSON.parse(response.body).recipientId).toEqual(recipientId);
    expect.assertions(3);
  });
});
