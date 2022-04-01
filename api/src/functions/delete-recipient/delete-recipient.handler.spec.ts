import { MockBusinessService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { default as handler } from '@household/api/functions/delete-recipient/delete-recipient.handler';
import { IDeleteRecipientService } from '@household/api/functions/delete-recipient/delete-recipient.service';
import { createRecipientId } from '@household/shared/common/test-data-factory';

describe('Delete recipient handler', () => {
  let mockDeleteRecipientService: MockBusinessService<IDeleteRecipientService>;
  let handlerFunction: ReturnType<typeof handler>;

  beforeEach(() => {
    mockDeleteRecipientService = jest.fn();
    handlerFunction = handler(mockDeleteRecipientService);
  });

  const recipientId = createRecipientId();
  const handlerEvent = {
    pathParameters: {
      recipientId,
    } as AWSLambda.APIGatewayProxyEventPathParameters,
  } as AWSLambda.APIGatewayProxyEvent;

  it('should handle business service error', async () => {
    const statusCode = 418;
    const message = 'This is an error';
    mockDeleteRecipientService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockDeleteRecipientService, {
      recipientId,
    });
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
    expect.assertions(3);
  });

  it('should respond with success', async () => {
    mockDeleteRecipientService.mockResolvedValue(undefined);

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockDeleteRecipientService, {
      recipientId,
    });
    expect(response.statusCode).toEqual(204);
    expect.assertions(2);
  });
});
