import { MockBusinessService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { default as handler } from '@household/api/functions/get-customer/get-customer.handler';
import { IGetCustomerService } from '@household/api/functions/get-customer/get-customer.service';
import { createCustomerId, createCustomerResponse } from '@household/shared/common/test-data-factory';

describe('Get customer handler', () => {
  let mockGetCustomerService: MockBusinessService<IGetCustomerService>;
  let handlerFunction: ReturnType<typeof handler>;

  beforeEach(() => {
    mockGetCustomerService = jest.fn();
    handlerFunction = handler(mockGetCustomerService);
  });

  const customerId = createCustomerId();
  const customer = createCustomerResponse();
  const handlerEvent = {
    pathParameters: {
      customerId,
    } as AWSLambda.APIGatewayProxyEventPathParameters,
  } as AWSLambda.APIGatewayProxyEvent;

  it('should handle business service error', async () => {
    const statusCode = 418;
    const message = 'This is an error';
    mockGetCustomerService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockGetCustomerService, {
      customerId,
    });
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
    expect.assertions(3);
  });

  it('should respond with success', async () => {
    mockGetCustomerService.mockResolvedValue(customer);

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockGetCustomerService, {
      customerId,
    });
    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.body)).toEqual(customer);
    expect.assertions(3);
  });
});
