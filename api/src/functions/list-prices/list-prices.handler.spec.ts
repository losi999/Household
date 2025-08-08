import { MockBusinessService } from '@household/shared/common/unit-testing';
import { default as handler } from '@household/api/functions/list-prices/list-prices.handler';
import { IListPricesService } from '@household/api/functions/list-prices/list-prices.service';
import { createPriceResponse } from '@household/shared/common/test-data-factory';

describe('List prices handler', () => {
  let mockListPricesService: MockBusinessService<IListPricesService>;
  let handlerFunction: ReturnType<typeof handler>;

  beforeEach(() => {
    mockListPricesService = jest.fn();
    handlerFunction = handler(mockListPricesService);
  });

  const prices = [createPriceResponse()];
  const handlerEvent = {} as AWSLambda.APIGatewayProxyEvent;

  it('should handle business service error', async () => {
    const statusCode = 418;
    const message = 'This is an error';
    mockListPricesService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    expect(mockListPricesService).toHaveBeenCalled();
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
    expect.assertions(3);
  });

  it('should respond with success', async () => {
    mockListPricesService.mockResolvedValue(prices);

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    expect(mockListPricesService).toHaveBeenCalled();
    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.body)).toEqual(prices);
    expect.assertions(3);
  });
});
