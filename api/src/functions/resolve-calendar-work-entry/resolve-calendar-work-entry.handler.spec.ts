import { MockBusinessService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { default as handler } from '@household/api/functions/resolve-calendar-work-entry/resolve-calendar-work-entry.handler';
import { IResolveCalendarWorkEntryService } from '@household/api/functions/resolve-calendar-work-entry/resolve-calendar-work-entry.service';
import { createTransactionId, testDataFactory } from '@household/shared/common/test-data-factory';
import { headerExpiresIn } from '@household/shared/constants';

describe('Resolve calendar work entry handler', () => {
  let mockResolveCalendarWorkEntryService: MockBusinessService<IResolveCalendarWorkEntryService>;
  let handlerFunction: ReturnType<typeof handler>;

  beforeEach(() => {
    mockResolveCalendarWorkEntryService = vi.fn();
    handlerFunction = handler(mockResolveCalendarWorkEntryService);
  });

  const body = testDataFactory.calendar.entry.resolution.request();
  const expiresIn = 3600;
  const calendarEntryId = testDataFactory.calendar.entry.id();
  const transactionId = createTransactionId();
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
    mockResolveCalendarWorkEntryService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockResolveCalendarWorkEntryService, {
      body,
      calendarEntryId,
      expiresIn,
    });
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
    expect.assertions(3);
  });

  it('should respond with success', async () => {
    mockResolveCalendarWorkEntryService.mockResolvedValue(transactionId);

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockResolveCalendarWorkEntryService, {
      body,
      calendarEntryId,
      expiresIn,
    });
    expect(response.statusCode).toEqual(201);
    expect(JSON.parse(response.body).transactionId).toEqual(transactionId);
    expect.assertions(3);
  });
});
