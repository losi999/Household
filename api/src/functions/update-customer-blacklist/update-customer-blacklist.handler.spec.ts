import { MockBusinessService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { default as handler } from '@household/api/functions/update-customer-blacklist/update-customer-blacklist.handler';
import { IUpdateCustomerBlacklistService } from '@household/api/functions/update-customer-blacklist/update-customer-blacklist.service';
import { customerDataFactory } from '@household/shared/common/test-data-factory';

describe('Update customer blacklist handler', () => {
  let mockCreateCustomerService: MockBusinessService<IUpdateCustomerBlacklistService>;
  let handlerFunction: ReturnType<typeof handler>;

  beforeEach(() => {
    mockCreateCustomerService = jest.fn();
    handlerFunction = handler(mockCreateCustomerService);
  });

  const body = [
    customerDataFactory.id(),
    customerDataFactory.id(),
  ];
  const handlerEvent = {
    body: JSON.stringify(body),
  } as AWSLambda.APIGatewayProxyEvent;

  it('should handle business service error', async () => {
    const statusCode = 418;
    const message = 'This is an error';
    mockCreateCustomerService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockCreateCustomerService, body);
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
    expect.assertions(3);
  });

  it('should respond with success', async () => {
    mockCreateCustomerService.mockResolvedValue(undefined);

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockCreateCustomerService, body);
    expect(response.statusCode).toEqual(204);
    expect.assertions(2);
  });
});
