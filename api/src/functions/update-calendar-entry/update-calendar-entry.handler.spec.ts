import { MockBusinessService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { default as handler } from '@household/api/functions/update-calendar-entry/update-calendar-entry.handler';
import { IUpdateCalendarEntryService } from '@household/api/functions/update-calendar-entry/update-calendar-entry.service';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { headerExpiresIn } from '@household/shared/constants';

describe('Update calendar entry handler', () => {
  let mockUpdateCalendarEntryService: MockBusinessService<IUpdateCalendarEntryService>;
  let handlerFunction: ReturnType<typeof handler>;

  beforeEach(() => {
    mockUpdateCalendarEntryService = jest.fn();
    handlerFunction = handler(mockUpdateCalendarEntryService);
  });

  const calendarEntryId = testDataFactory.calendar.entry.id();
  const body = testDataFactory.calendar.entry.request.work();
  const expiresIn = 3600;
  const handlerEvent = {
    body: JSON.stringify(body),
    pathParameters: {
      calendarEntryId,
    } as AWSLambda.APIGatewayProxyEventPathParameters,
    headers: {
      [headerExpiresIn]: `${expiresIn}`,
    } as AWSLambda.APIGatewayProxyEventHeaders,
  } as AWSLambda.APIGatewayProxyEvent;

  it('should handle business service error', async () => {
    const statusCode = 418;
    const message = 'This is an error';
    mockUpdateCalendarEntryService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockUpdateCalendarEntryService, {
      calendarEntryId,
      body,
      expiresIn,
    });
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
    expect.assertions(3);
  });

  it('should respond with success', async () => {
    mockUpdateCalendarEntryService.mockResolvedValue(undefined);

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockUpdateCalendarEntryService, {
      calendarEntryId,
      body,
      expiresIn,
    });
    expect(response.statusCode).toEqual(201);
    expect(JSON.parse(response.body).calendarEntryId).toEqual(calendarEntryId);
    expect.assertions(3);
  });
});
