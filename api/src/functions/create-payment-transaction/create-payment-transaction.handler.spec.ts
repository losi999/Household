import { MockBusinessService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { default as handler } from '@household/api/functions/create-payment-transaction/create-payment-transaction.handler';
import { ICreatePaymentTransactionService } from '@household/api/functions/create-payment-transaction/create-payment-transaction.service';
import { createPaymentTransactionRequest } from '@household/shared/common/test-data-factory';
import { headerExpiresIn } from '@household/shared/constants';

describe('Create payment transaction handler', () => {
  let mockCreatePaymentTransactionService: MockBusinessService<ICreatePaymentTransactionService>;
  let handlerFunction: ReturnType<typeof handler>;

  beforeEach(() => {
    mockCreatePaymentTransactionService = jest.fn();
    handlerFunction = handler(mockCreatePaymentTransactionService);
  });

  const body = createPaymentTransactionRequest();
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
    mockCreatePaymentTransactionService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockCreatePaymentTransactionService, {
      body,
      expiresIn,
    });
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
    expect.assertions(3);
  });

  it('should respond with success', async () => {
    const transactionId = 'transactionId';

    mockCreatePaymentTransactionService.mockResolvedValue(transactionId);

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockCreatePaymentTransactionService, {
      body,
      expiresIn,
    });
    expect(response.statusCode).toEqual(201);
    expect(JSON.parse(response.body).transactionId).toEqual(transactionId);
    expect.assertions(3);
  });
});
