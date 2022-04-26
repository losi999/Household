import { MockBusinessService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { default as handler } from '@household/api/functions/update-category/update-category.handler';
import { IUpdateCategoryService } from '@household/api/functions/update-category/update-category.service';
import { createCategoryId, createCategoryRequest } from '@household/shared/common/test-data-factory';
import { headerExpiresIn } from '@household/shared/constants';

describe('Update category handler', () => {
  let mockUpdateCategoryService: MockBusinessService<IUpdateCategoryService>;
  let handlerFunction: ReturnType<typeof handler>;

  beforeEach(() => {
    mockUpdateCategoryService = jest.fn();
    handlerFunction = handler(mockUpdateCategoryService);
  });

  const categoryId = createCategoryId();
  const body = createCategoryRequest();
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
    mockUpdateCategoryService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockUpdateCategoryService, {
      categoryId,
      body,
      expiresIn,
    });
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
    expect.assertions(3);
  });

  it('should respond with success', async () => {
    mockUpdateCategoryService.mockResolvedValue(undefined);

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockUpdateCategoryService, {
      categoryId,
      body,
      expiresIn,
    });
    expect(response.statusCode).toEqual(201);
    expect(JSON.parse(response.body).categoryId).toEqual(categoryId);
    expect.assertions(3);
  });
});
