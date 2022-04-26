import { MockBusinessService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { default as handler } from '@household/api/functions/create-category/create-category.handler';
import { ICreateCategoryService } from '@household/api/functions/create-category/create-category.service';
import { createCategoryRequest } from '@household/shared/common/test-data-factory';
import { headerExpiresIn } from '@household/shared/constants';

describe('Create category handler', () => {
  let mockCreateCategoryService: MockBusinessService<ICreateCategoryService>;
  let handlerFunction: ReturnType<typeof handler>;

  beforeEach(() => {
    mockCreateCategoryService = jest.fn();
    handlerFunction = handler(mockCreateCategoryService);
  });

  const body = createCategoryRequest();
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
    mockCreateCategoryService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockCreateCategoryService, {
      body,
      expiresIn,
    });
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
    expect.assertions(3);
  });

  it('should respond with success', async () => {
    const categoryId = 'categoryId';

    mockCreateCategoryService.mockResolvedValue(categoryId);

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockCreateCategoryService, {
      body,
      expiresIn,
    });
    expect(response.statusCode).toEqual(201);
    expect(JSON.parse(response.body).categoryId).toEqual(categoryId);
    expect.assertions(3);
  });
});
