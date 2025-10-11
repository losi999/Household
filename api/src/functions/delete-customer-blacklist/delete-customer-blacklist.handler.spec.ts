import { MockBusinessService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { default as handler } from '@household/api/functions/delete-customer-blacklist/delete-customer-blacklist.handler';
import { IDeleteCustomerBlacklistService } from '@household/api/functions/delete-customer-blacklist/delete-customer-blacklist.service';
import { customerDataFactory } from '@household/shared/common/test-data-factory';

describe('Delete customer blacklist handler', () => {
  let mockDeleteCustomerBlacklistService: MockBusinessService<IDeleteCustomerBlacklistService>;
  let handlerFunction: ReturnType<typeof handler>;

  beforeEach(() => {
    mockDeleteCustomerBlacklistService = jest.fn();
    handlerFunction = handler(mockDeleteCustomerBlacklistService);
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
    mockDeleteCustomerBlacklistService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockDeleteCustomerBlacklistService, body);
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
    expect.assertions(3);
  });

  it('should respond with success', async () => {
    mockDeleteCustomerBlacklistService.mockResolvedValue(undefined);

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockDeleteCustomerBlacklistService, body);
    expect(response.statusCode).toEqual(204);
    expect.assertions(2);
  });
});
