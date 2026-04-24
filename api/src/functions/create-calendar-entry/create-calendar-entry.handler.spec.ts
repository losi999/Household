import { MockBusinessService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { default as handler } from '@household/api/functions/create-calendar-entry/create-calendar-entry.handler';
import { ICreateCalendarEntryService } from '@household/api/functions/create-calendar-entry/create-calendar-entry.service';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { headerExpiresIn } from '@household/shared/constants';

describe('Create calendar entry handler', () => {
  let mockCreateCalendarEntryService: MockBusinessService<ICreateCalendarEntryService>;
  let handlerFunction: ReturnType<typeof handler>;

  beforeEach(() => {
    mockCreateCalendarEntryService = vi.fn();
    handlerFunction = handler(mockCreateCalendarEntryService);
  });

  const calendarEntryId = testDataFactory.calendar.entry.id();
  const body = testDataFactory.calendar.entry.request.work();
  const expiresIn = 3600;
  const handlerEvent = {
    body: JSON.stringify(body),
    headers: {
      [headerExpiresIn]: `${expiresIn}`,
    } as AWSLambda.APIGatewayProxyEventHeaders,
  } as AWSLambda.APIGatewayProxyEvent;

  it('should handle business service error', async () => {

    const statusCode = 418;
    const message = 'This is an error';
    mockCreateCalendarEntryService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockCreateCalendarEntryService, {
      body,
      expiresIn,
    });
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
    expect.assertions(3);
  });

  it('should respond with success', async () => {
    mockCreateCalendarEntryService.mockResolvedValue(calendarEntryId);

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockCreateCalendarEntryService, {
      body,
      expiresIn,
    });
    expect(response.statusCode).toEqual(201);
    expect(JSON.parse(response.body).calendarEntryId).toEqual(calendarEntryId);
    expect.assertions(3);
  });
});
