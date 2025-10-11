import { MockBusinessService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { default as handler } from '@household/api/functions/pay-calendar-work-entry/pay-calendar-work-entry.handler';
import { IPayCalendarWorkEntryService } from '@household/api/functions/pay-calendar-work-entry/pay-calendar-work-entry.service';
import { createTransactionId, calendarEntryDataFactory } from '@household/shared/common/test-data-factory';

describe('Create price handler', () => {
  let mockPayCalendarWorkEntryService: MockBusinessService<IPayCalendarWorkEntryService>;
  let handlerFunction: ReturnType<typeof handler>;

  beforeEach(() => {
    mockPayCalendarWorkEntryService = jest.fn();
    handlerFunction = handler(mockPayCalendarWorkEntryService);
  });

  const body = calendarEntryDataFactory.paymentRequest();
  const calendarEntryId = calendarEntryDataFactory.id();
  const transactionId = createTransactionId();
  const handlerEvent = {
    body: JSON.stringify(body),
    pathParameters: {
      calendarEntryId,
    } as AWSLambda.APIGatewayProxyEventPathParameters,
  } as AWSLambda.APIGatewayProxyEvent;

  it('should handle business service error', async () => {
    const statusCode = 418;
    const message = 'This is an error';
    mockPayCalendarWorkEntryService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockPayCalendarWorkEntryService, {
      body,
      calendarEntryId,
    });
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
    expect.assertions(3);
  });

  it('should respond with success', async () => {
    mockPayCalendarWorkEntryService.mockResolvedValue(transactionId);

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockPayCalendarWorkEntryService, {
      body,
      calendarEntryId,
    });
    expect(response.statusCode).toEqual(201);
    expect(JSON.parse(response.body).transactionId).toEqual(transactionId);
    expect.assertions(3);
  });
});
