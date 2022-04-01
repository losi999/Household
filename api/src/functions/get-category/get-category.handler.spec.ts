import { MockBusinessService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { default as handler } from '@household/api/functions/get-category/get-category.handler';
import { IGetCategoryService } from '@household/api/functions/get-category/get-category.service';
import { createCategoryId, createCategoryResponse } from '@household/shared/common/test-data-factory';

describe('Get category handler', () => {
  let mockGetCategoryService: MockBusinessService<IGetCategoryService>;
  let handlerFunction: ReturnType<typeof handler>;

  beforeEach(() => {
    mockGetCategoryService = jest.fn();
    handlerFunction = handler(mockGetCategoryService);
  });

  const categoryId = createCategoryId();
  const category = createCategoryResponse();
  const handlerEvent = {
    pathParameters: {
      categoryId,
    } as AWSLambda.APIGatewayProxyEventPathParameters,
  } as AWSLambda.APIGatewayProxyEvent;

  it('should handle business service error', async () => {
    const statusCode = 418;
    const message = 'This is an error';
    mockGetCategoryService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockGetCategoryService, {
      categoryId,
    });
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
    expect.assertions(3);
  });

  it('should respond with success', async () => {
    mockGetCategoryService.mockResolvedValue(category);

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockGetCategoryService, {
      categoryId,
    });
    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.body)).toEqual(category);
    expect.assertions(3);
  });
});
