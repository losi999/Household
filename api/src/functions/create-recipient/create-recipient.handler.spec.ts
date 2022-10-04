import { MockBusinessService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { default as handler } from '@household/api/functions/create-recipient/create-recipient.handler';
import { ICreateRecipientService } from '@household/api/functions/create-recipient/create-recipient.service';
import { createRecipientId, createRecipientRequest } from '@household/shared/common/test-data-factory';
import { headerExpiresIn } from '@household/shared/constants';

describe('Create recipient handler', () => {
  let mockCreateRecipientService: MockBusinessService<ICreateRecipientService>;
  let handlerFunction: ReturnType<typeof handler>;

  beforeEach(() => {
    mockCreateRecipientService = jest.fn();
    handlerFunction = handler(mockCreateRecipientService);
  });

  const body = createRecipientRequest();
  const expiresIn = 3600;
  const handlerEvent = {
    body: JSON.stringify(body),
    headers: {
      [headerExpiresIn]: `${expiresIn}`,
    } as AWSLambda.APIGatewayProxyEventHeaders,
  } as AWSLambda.APIGatewayProxyEvent;

  it('should handle business service error', async () => {

    const statusCode = 418;
    const message = 'This is an error';
    mockCreateRecipientService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockCreateRecipientService, {
      body,
      expiresIn,
    });
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
    expect.assertions(3);
  });

  it('should respond with success', async () => {
    const recipientId = createRecipientId();

    mockCreateRecipientService.mockResolvedValue(recipientId);

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockCreateRecipientService, {
      body,
      expiresIn,
    });
    expect(response.statusCode).toEqual(201);
    expect(JSON.parse(response.body).recipientId).toEqual(recipientId);
    expect.assertions(3);
  });
});
