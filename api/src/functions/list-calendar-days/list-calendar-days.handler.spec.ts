import { MockBusinessService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { default as handler } from '@household/api/functions/list-calendar-days/list-calendar-days.handler';
import { IListCalendarDaysService } from '@household/api/functions/list-calendar-days/list-calendar-days.service';
import { testDataFactory } from '@household/shared/common/test-data-factory';

describe('List calendar days handler', () => {
  let mockListCalendarDaysService: MockBusinessService<IListCalendarDaysService>;
  let handlerFunction: ReturnType<typeof handler>;

  beforeEach(() => {
    mockListCalendarDaysService = vi.fn();
    handlerFunction = handler(mockListCalendarDaysService);
  });

  const calendarDays = [testDataFactory.calendar.day.response.holiday()];
  const dateFrom = '2025-10-11';
  const dateTo = '2025-10-12';
  const handlerEvent = {
    queryStringParameters: {
      dateFrom,
      dateTo,
    } as AWSLambda.APIGatewayProxyEventQueryStringParameters,
  } as AWSLambda.APIGatewayProxyEvent;

  it('should handle business service error', async () => {
    const statusCode = 418;
    const message = 'This is an error';
    mockListCalendarDaysService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockListCalendarDaysService, {
      dateFrom,
      dateTo,
    });
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
    expect.assertions(3);
  });

  it('should respond with success', async () => {
    mockListCalendarDaysService.mockResolvedValue(calendarDays);

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockListCalendarDaysService, {
      dateFrom,
      dateTo,
    });
    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.body)).toEqual(calendarDays);
    expect.assertions(3);
  });
});
