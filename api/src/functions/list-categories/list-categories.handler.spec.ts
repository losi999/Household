import { MockBusinessService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { default as handler } from '@household/api/functions/list-categories/list-categories.handler';
import { IListCategoriesService } from '@household/api/functions/list-categories/list-categories.service';
import { createCategoryResponse } from '@household/shared/common/test-data-factory';

describe('List categories handler', () => {
  let mockListCategoriesService: MockBusinessService<IListCategoriesService>;
  let handlerFunction: ReturnType<typeof handler>;

  beforeEach(() => {
    mockListCategoriesService = jest.fn();
    handlerFunction = handler(mockListCategoriesService);
  });
  const categoryType = 'regular';
  const categories = [createCategoryResponse()];
  const handlerEvent = {
    queryStringParameters: {
      categoryType,
    } as AWSLambda.ALBEventQueryStringParameters,
  } as AWSLambda.APIGatewayProxyEvent;

  it('should handle business service error', async () => {
    const statusCode = 418;
    const message = 'This is an error';
    mockListCategoriesService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockListCategoriesService, {
      categoryType,
    });
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
    expect.assertions(3);
  });

  it('should respond with success', async () => {
    mockListCategoriesService.mockResolvedValue(categories);

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockListCategoriesService, {
      categoryType,
    });
    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.body)).toEqual(categories);
    expect.assertions(3);
  });
});
