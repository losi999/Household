import { MockBusinessService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { default as handler } from '@household/api/functions/list-customer-works/list-customer-works.handler';
import { calendarEntryDataFactory, customerDataFactory } from '@household/shared/common/test-data-factory';
import { IListCustomerWorksService } from '@household/api/functions/list-customer-works/list-customer-works.service';

describe('List customer works handler', () => {
  let mockListCustomerWorksService: MockBusinessService<IListCustomerWorksService>;
  let handlerFunction: ReturnType<typeof handler>;

  beforeEach(() => {
    mockListCustomerWorksService = jest.fn();
    handlerFunction = handler(mockListCustomerWorksService);
  });

  const customerId = customerDataFactory.id();
  const calendarEntry = calendarEntryDataFactory.responseBase();
  const handlerEvent = {
    pathParameters: {
      customerId,
    } as AWSLambda.APIGatewayProxyEventPathParameters,
  } as AWSLambda.APIGatewayProxyEvent;

  it('should handle business service error', async () => {
    const statusCode = 418;
    const message = 'This is an error';
    mockListCustomerWorksService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockListCustomerWorksService, {
      customerId,
    });
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
    expect.assertions(3);
  });

  it('should respond with success', async () => {
    mockListCustomerWorksService.mockResolvedValue([calendarEntry]);

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockListCustomerWorksService, {
      customerId,
    });
    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.body)).toEqual([calendarEntry]);
    expect.assertions(3);
  });
});
