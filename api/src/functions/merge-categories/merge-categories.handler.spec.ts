import { MockBusinessService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { default as handler } from '@household/api/functions/merge-categories/merge-categories.handler';
import { IMergeCategoriesService } from '@household/api/functions/merge-categories/merge-categories.service';
import { createCategoryId } from '@household/shared/common/test-data-factory';

describe('Merge categories handler', () => {
  let mockMergeCategoriesService: MockBusinessService<IMergeCategoriesService>;
  let handlerFunction: ReturnType<typeof handler>;

  beforeEach(() => {
    mockMergeCategoriesService = jest.fn();
    handlerFunction = handler(mockMergeCategoriesService);
  });

  const categoryId = createCategoryId();
  const body = [createCategoryId()];
  const handlerEvent = {
    body: JSON.stringify(body),
    pathParameters: {
      categoryId,
    } as AWSLambda.APIGatewayProxyEventPathParameters,
  } as AWSLambda.APIGatewayProxyEvent;

  it('should handle business service error', async () => {
    const statusCode = 418;
    const message = 'This is an error';
    mockMergeCategoriesService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockMergeCategoriesService, {
      categoryId,
      body,
    });
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
    expect.assertions(3);
  });

  it('should respond with success', async () => {
    mockMergeCategoriesService.mockResolvedValue(undefined);

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockMergeCategoriesService, {
      categoryId,
      body,
    });
    expect(response.statusCode).toEqual(201);
    expect(JSON.parse(response.body).categoryId).toEqual(categoryId);
    expect.assertions(3);
  });
});
