import { MockBusinessService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { default as handler } from '@household/api/functions/get-calendar-entry/get-calendar-entry.handler';
import { IGetCalendarEntryService } from '@household/api/functions/get-calendar-entry/get-calendar-entry.service';
import { calendarEntryDataFactory } from '@household/shared/common/test-data-factory';

describe('Get calendar entry handler', () => {
  let mockGetCalendarEntryService: MockBusinessService<IGetCalendarEntryService>;
  let handlerFunction: ReturnType<typeof handler>;

  beforeEach(() => {
    mockGetCalendarEntryService = jest.fn();
    handlerFunction = handler(mockGetCalendarEntryService);
  });

  const calendarEntryId = calendarEntryDataFactory.id();
  const calendarEntry = calendarEntryDataFactory.personalResponse();

  const handlerEvent = {
    pathParameters: {
      calendarEntryId,
    } as AWSLambda.APIGatewayProxyEventPathParameters,

  } as AWSLambda.APIGatewayProxyEvent;

  it('should handle business service error', async () => {
    const statusCode = 418;
    const message = 'This is an error';
    mockGetCalendarEntryService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockGetCalendarEntryService, {
      calendarEntryId,
    });
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
    expect.assertions(3);
  });

  it('should respond with success', async () => {
    mockGetCalendarEntryService.mockResolvedValue(calendarEntry);

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockGetCalendarEntryService, {
      calendarEntryId,
    });
    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.body)).toEqual(calendarEntry);
    expect.assertions(3);
  });
});
