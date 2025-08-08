import { MockBusinessService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { default as handler } from '@household/api/functions/delete-price/delete-price.handler';
import { IDeletePriceService } from '@household/api/functions/delete-price/delete-price.service';
import { createPriceId } from '@household/shared/common/test-data-factory';

describe('Delete price handler', () => {
  let mockDeletePriceService: MockBusinessService<IDeletePriceService>;
  let handlerFunction: ReturnType<typeof handler>;

  beforeEach(() => {
    mockDeletePriceService = jest.fn();
    handlerFunction = handler(mockDeletePriceService);
  });

  const priceId = createPriceId();
  const handlerEvent = {
    pathParameters: {
      priceId,
    } as AWSLambda.APIGatewayProxyEventPathParameters,
  } as AWSLambda.APIGatewayProxyEvent;

  it('should handle business service error', async () => {
    const statusCode = 418;
    const message = 'This is an error';
    mockDeletePriceService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockDeletePriceService, {
      priceId,
    });
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
    expect.assertions(3);
  });

  it('should respond with success', async () => {
    mockDeletePriceService.mockResolvedValue(undefined);

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockDeletePriceService, {
      priceId,
    });
    expect(response.statusCode).toEqual(204);
    expect.assertions(2);
  });
});
