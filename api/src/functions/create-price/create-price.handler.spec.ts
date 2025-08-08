import { MockBusinessService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { default as handler } from '@household/api/functions/create-price/create-price.handler';
import { ICreatePriceService } from '@household/api/functions/create-price/create-price.service';
import { createPriceId, createPriceRequest } from '@household/shared/common/test-data-factory';
import { headerExpiresIn } from '@household/shared/constants';

describe('Create price handler', () => {
  let mockCreatePriceService: MockBusinessService<ICreatePriceService>;
  let handlerFunction: ReturnType<typeof handler>;

  beforeEach(() => {
    mockCreatePriceService = jest.fn();
    handlerFunction = handler(mockCreatePriceService);
  });

  const body = createPriceRequest();
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
    mockCreatePriceService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockCreatePriceService, {
      body,
      expiresIn,
    });
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
    expect.assertions(3);
  });

  it('should respond with success', async () => {
    const priceId = createPriceId();

    mockCreatePriceService.mockResolvedValue(priceId);

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockCreatePriceService, {
      body,
      expiresIn,
    });
    expect(response.statusCode).toEqual(201);
    expect(JSON.parse(response.body).priceId).toEqual(priceId);
    expect.assertions(3);
  });
});
