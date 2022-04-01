import { MockBusinessService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { default as handler } from '@household/api/functions/get-recipient/get-recipient.handler';
import { IGetRecipientService } from '@household/api/functions/get-recipient/get-recipient.service';
import { createRecipientId, createRecipientResponse } from '@household/shared/common/test-data-factory';

describe('Get recipient handler', () => {
  let mockGetRecipientService: MockBusinessService<IGetRecipientService>;
  let handlerFunction: ReturnType<typeof handler>;

  beforeEach(() => {
    mockGetRecipientService = jest.fn();
    handlerFunction = handler(mockGetRecipientService);
  });

  const recipientId = createRecipientId();
  const recipient = createRecipientResponse();
  const handlerEvent = {
    pathParameters: {
      recipientId,
    } as AWSLambda.APIGatewayProxyEventPathParameters,
  } as AWSLambda.APIGatewayProxyEvent;

  it('should handle business service error', async () => {
    const statusCode = 418;
    const message = 'This is an error';
    mockGetRecipientService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockGetRecipientService, {
      recipientId,
    });
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
    expect.assertions(3);
  });

  it('should respond with success', async () => {
    mockGetRecipientService.mockResolvedValue(recipient);

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockGetRecipientService, {
      recipientId,
    });
    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.body)).toEqual(recipient);
    expect.assertions(3);
  });
});
