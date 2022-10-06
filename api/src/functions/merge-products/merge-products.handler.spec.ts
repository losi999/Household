import { MockBusinessService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { default as handler } from '@household/api/functions/merge-products/merge-products.handler';
import { IMergeProductsService } from '@household/api/functions/merge-products/merge-products.service';
import { createProductId } from '@household/shared/common/test-data-factory';

describe('Merge products handler', () => {
  let mockMergeProductsService: MockBusinessService<IMergeProductsService>;
  let handlerFunction: ReturnType<typeof handler>;

  beforeEach(() => {
    mockMergeProductsService = jest.fn();
    handlerFunction = handler(mockMergeProductsService);
  });

  const productId = createProductId();
  const body = [createProductId()];
  const handlerEvent = {
    body: JSON.stringify(body),
    pathParameters: {
      productId,
    } as AWSLambda.APIGatewayProxyEventPathParameters,
  } as AWSLambda.APIGatewayProxyEvent;

  it('should handle business service error', async () => {
    const statusCode = 418;
    const message = 'This is an error';
    mockMergeProductsService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockMergeProductsService, {
      productId,
      body,
    });
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
    expect.assertions(3);
  });

  it('should respond with success', async () => {
    mockMergeProductsService.mockResolvedValue(undefined);

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockMergeProductsService, {
      productId,
      body,
    });
    expect(response.statusCode).toEqual(201);
    expect(JSON.parse(response.body).productId).toEqual(productId);
    expect.assertions(3);
  });
});
