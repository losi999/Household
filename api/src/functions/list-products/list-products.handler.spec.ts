import { MockBusinessService } from '@household/shared/common/unit-testing';
import { default as handler } from '@household/api/functions/list-products/list-products.handler';
import { IListProductsService } from '@household/api/functions/list-products/list-products.service';
import { createProductGroupedResponse } from '@household/shared/common/test-data-factory';

describe('List products handler', () => {
  let mockListProductsService: MockBusinessService<IListProductsService>;
  let handlerFunction: ReturnType<typeof handler>;

  beforeEach(() => {
    mockListProductsService = jest.fn();
    handlerFunction = handler(mockListProductsService);
  });

  const products = [createProductGroupedResponse()];
  const handlerEvent = {} as AWSLambda.APIGatewayProxyEvent;

  it('should handle business service error', async () => {
    const statusCode = 418;
    const message = 'This is an error';
    mockListProductsService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    expect(mockListProductsService).toHaveBeenCalled();
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
    expect.assertions(3);
  });

  it('should respond with success', async () => {
    mockListProductsService.mockResolvedValue(products);

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    expect(mockListProductsService).toHaveBeenCalled();
    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.body)).toEqual(products);
    expect.assertions(3);
  });
});
