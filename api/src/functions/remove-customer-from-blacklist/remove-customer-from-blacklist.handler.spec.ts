import { MockBusinessService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { default as handler } from '@household/api/functions/remove-customer-from-blacklist/remove-customer-from-blacklist.handler';
import { IRemoveCustomerFromBlacklistService } from '@household/api/functions/remove-customer-from-blacklist/remove-customer-from-blacklist.service';
import { testDataFactory } from '@household/shared/common/test-data-factory';

describe('Remove customer from blacklist handler', () => {
  let mockRemoveCustomerFromBlacklistService: MockBusinessService<IRemoveCustomerFromBlacklistService>;
  let handlerFunction: ReturnType<typeof handler>;

  beforeEach(() => {
    mockRemoveCustomerFromBlacklistService = vi.fn();
    handlerFunction = handler(mockRemoveCustomerFromBlacklistService);
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
    mockRemoveCustomerFromBlacklistService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockRemoveCustomerFromBlacklistService, body);
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
    expect.assertions(3);
  });

  it('should respond with success', async () => {
    mockRemoveCustomerFromBlacklistService.mockResolvedValue(undefined);

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockRemoveCustomerFromBlacklistService, body);
    expect(response.statusCode).toEqual(204);
    expect.assertions(2);
  });
});
