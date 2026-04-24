import { MockBusinessService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { default as handler } from '@household/api/functions/add-customer-to-blacklist/add-customer-to-blacklist.handler';
import { IAddCustomerToBlacklistService } from '@household/api/functions/add-customer-to-blacklist/add-customer-to-blacklist.service';
import { testDataFactory } from '@household/shared/common/test-data-factory';

describe('Add customer to blacklist handler', () => {
  let mockAddCustomerToBlacklistService: MockBusinessService<IAddCustomerToBlacklistService>;
  let handlerFunction: ReturnType<typeof handler>;

  beforeEach(() => {
    mockAddCustomerToBlacklistService = vi.fn();
    handlerFunction = handler(mockAddCustomerToBlacklistService);
  });

  const body = [
    testDataFactory.customer.id(),
    testDataFactory.customer.id(),
  ];
  const handlerEvent = {
    body: JSON.stringify(body),
  } as AWSLambda.APIGatewayProxyEvent;

  it('should handle business service error', async () => {
    const statusCode = 418;
    const message = 'This is an error';
    mockAddCustomerToBlacklistService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockAddCustomerToBlacklistService, body);
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
    expect.assertions(3);
  });

  it('should respond with success', async () => {
    mockAddCustomerToBlacklistService.mockResolvedValue(undefined);

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockAddCustomerToBlacklistService, body);
    expect(response.statusCode).toEqual(204);
    expect.assertions(2);
  });
});
