import { MockBusinessService } from '@household/shared/common/unit-testing';
import { default as handler } from '@household/api/functions/list-customers/list-customers.handler';
import { IListCustomersService } from '@household/api/functions/list-customers/list-customers.service';
import { createCustomerResponse } from '@household/shared/common/test-data-factory';

describe('List customers handler', () => {
  let mockListCustomersService: MockBusinessService<IListCustomersService>;
  let handlerFunction: ReturnType<typeof handler>;

  beforeEach(() => {
    mockListCustomersService = jest.fn();
    handlerFunction = handler(mockListCustomersService);
  });

  const customers = [createCustomerResponse()];
  const handlerEvent = {} as AWSLambda.APIGatewayProxyEvent;

  it('should handle business service error', async () => {
    const statusCode = 418;
    const message = 'This is an error';
    mockListCustomersService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    expect(mockListCustomersService).toHaveBeenCalled();
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
    expect.assertions(3);
  });

  it('should respond with success', async () => {
    mockListCustomersService.mockResolvedValue(customers);

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    expect(mockListCustomersService).toHaveBeenCalled();
    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.body)).toEqual(customers);
    expect.assertions(3);
  });
});
