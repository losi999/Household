import { MockBusinessService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { default as handler } from '@household/api/functions/delete-calendar-entry/delete-calendar-entry.handler';
import { IDeleteCalendarEntryService } from '@household/api/functions/delete-calendar-entry/delete-calendar-entry.service';
import { testDataFactory } from '@household/shared/common/test-data-factory';

describe('Delete calendar entry handler', () => {
  let mockDeleteCalendarEntryService: MockBusinessService<IDeleteCalendarEntryService>;
  let handlerFunction: ReturnType<typeof handler>;

  beforeEach(() => {
    mockDeleteCalendarEntryService = jest.fn();
    handlerFunction = handler(mockDeleteCalendarEntryService);
  });

  const calendarEntryId = testDataFactory.calendar.entry.id();
  const handlerEvent = {
    pathParameters: {
      calendarEntryId,
    } as AWSLambda.APIGatewayProxyEventPathParameters,
  } as AWSLambda.APIGatewayProxyEvent;

  it('should handle business service error', async () => {
    const statusCode = 418;
    const message = 'This is an error';
    mockDeleteCalendarEntryService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockDeleteCalendarEntryService, {
      calendarEntryId,
    });
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
    expect.assertions(3);
  });

  it('should respond with success', async () => {
    mockDeleteCalendarEntryService.mockResolvedValue(undefined);

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockDeleteCalendarEntryService, {
      calendarEntryId,
    });
    expect(response.statusCode).toEqual(204);
    expect.assertions(2);
  });
});
