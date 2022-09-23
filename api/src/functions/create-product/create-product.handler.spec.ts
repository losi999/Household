import { MockBusinessService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { default as handler } from '@household/api/functions/create-product/create-product.handler';
import { ICreateProductService } from '@household/api/functions/create-product/create-product.service';
import { createCategoryId, createProductRequest } from '@household/shared/common/test-data-factory';
import { headerExpiresIn } from '@household/shared/constants';

describe('Create product handler', () => {
  let mockCreateProductService: MockBusinessService<ICreateProductService>;
  let handlerFunction: ReturnType<typeof handler>;

  beforeEach(() => {
    mockCreateProductService = jest.fn();
    handlerFunction = handler(mockCreateProductService);
  });

  const categoryId = createCategoryId();
  const body = createProductRequest();
  const expiresIn = 3600;
  const handlerEvent = {
    body: JSON.stringify(body),
    pathParameters: {
      categoryId,
    } as AWSLambda.APIGatewayProxyEventPathParameters,
    headers: {
      [headerExpiresIn]: `${expiresIn}`,
    } as AWSLambda.APIGatewayProxyEventHeaders,
  } as AWSLambda.APIGatewayProxyEvent;

  it('should handle business service error', async () => {

    const statusCode = 418;
    const message = 'This is an error';
    mockCreateProductService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockCreateProductService, {
      body,
      categoryId,
      expiresIn,
    });
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
    expect.assertions(3);
  });

  it('should respond with success', async () => {
    const productId = 'productId';

    mockCreateProductService.mockResolvedValue(productId);

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockCreateProductService, {
      body,
      categoryId,
      expiresIn,
    });
    expect(response.statusCode).toEqual(201);
    expect(JSON.parse(response.body).productId).toEqual(productId);
    expect.assertions(3);
  });
});
