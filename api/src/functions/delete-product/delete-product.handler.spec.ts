import { MockBusinessService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { default as handler } from '@household/api/functions/delete-product/delete-product.handler';
import { IDeleteProductService } from '@household/api/functions/delete-product/delete-product.service';
import { createProductId } from '@household/shared/common/test-data-factory';

describe('Delete product handler', () => {
  let mockDeleteProductService: MockBusinessService<IDeleteProductService>;
  let handlerFunction: ReturnType<typeof handler>;

  beforeEach(() => {
    mockDeleteProductService = jest.fn();
    handlerFunction = handler(mockDeleteProductService);
  });

  const productId = createProductId();
  const handlerEvent = {
    pathParameters: {
      productId,
    } as AWSLambda.APIGatewayProxyEventPathParameters,
  } as AWSLambda.APIGatewayProxyEvent;

  it('should handle business service error', async () => {
    const statusCode = 418;
    const message = 'This is an error';
    mockDeleteProductService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockDeleteProductService, {
      productId,
    });
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
    expect.assertions(3);
  });

  it('should respond with success', async () => {
    mockDeleteProductService.mockResolvedValue(undefined);

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockDeleteProductService, {
      productId,
    });
    expect(response.statusCode).toEqual(204);
    expect.assertions(2);
  });
});
