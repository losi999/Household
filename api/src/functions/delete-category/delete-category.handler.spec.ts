import { MockBusinessService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { default as handler } from '@household/api/functions/delete-category/delete-category.handler';
import { IDeleteCategoryService } from '@household/api/functions/delete-category/delete-category.service';
import { createCategoryId } from '@household/shared/common/test-data-factory';

describe('Delete category handler', () => {
  let mockDeleteCategoryService: MockBusinessService<IDeleteCategoryService>;
  let handlerFunction: ReturnType<typeof handler>;

  beforeEach(() => {
    mockDeleteCategoryService = jest.fn();
    handlerFunction = handler(mockDeleteCategoryService);
  });

  const categoryId = createCategoryId();
  const handlerEvent = {
    pathParameters: {
      categoryId,
    } as AWSLambda.APIGatewayProxyEventPathParameters,
  } as AWSLambda.APIGatewayProxyEvent;

  it('should handle business service error', async () => {
    const statusCode = 418;
    const message = 'This is an error';
    mockDeleteCategoryService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockDeleteCategoryService, {
      categoryId,
    });
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
    expect.assertions(3);
  });

  it('should respond with success', async () => {
    mockDeleteCategoryService.mockResolvedValue(undefined);

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockDeleteCategoryService, {
      categoryId,
    });
    expect(response.statusCode).toEqual(204);
    expect.assertions(2);
  });
});
