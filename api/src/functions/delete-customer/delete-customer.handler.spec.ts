import { MockBusinessService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { default as handler } from '@household/api/functions/delete-customer/delete-customer.handler';
import { IDeleteCustomerService } from '@household/api/functions/delete-customer/delete-customer.service';
import { testDataFactory } from '@household/shared/common/test-data-factory';

describe('Delete customer handler', () => {
  let mockDeleteCustomerService: MockBusinessService<IDeleteCustomerService>;
  let handlerFunction: ReturnType<typeof handler>;

  beforeEach(() => {
    mockDeleteCustomerService = vi.fn();
    handlerFunction = handler(mockDeleteCustomerService);
  });

  const customerId = testDataFactory.customer.id();
  const handlerEvent = {
    pathParameters: {
      customerId,
    } as AWSLambda.APIGatewayProxyEventPathParameters,
  } as AWSLambda.APIGatewayProxyEvent;

  it('should handle business service error', async () => {
    const statusCode = 418;
    const message = 'This is an error';
    mockDeleteCustomerService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockDeleteCustomerService, {
      customerId,
    });
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
    expect.assertions(3);
  });

  it('should respond with success', async () => {
    mockDeleteCustomerService.mockResolvedValue(undefined);

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockDeleteCustomerService, {
      customerId,
    });
    expect(response.statusCode).toEqual(204);
    expect.assertions(2);
  });
});
