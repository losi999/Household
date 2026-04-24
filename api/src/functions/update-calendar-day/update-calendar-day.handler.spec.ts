import { MockBusinessService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { default as handler } from '@household/api/functions/update-calendar-day/update-calendar-day.handler';
import { IUpdateCalendarDayService } from '@household/api/functions/update-calendar-day/update-calendar-day.service';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { headerExpiresIn } from '@household/shared/constants';

describe('Update calendar day handler', () => {
  let mockUpdateCalendarDayService: MockBusinessService<IUpdateCalendarDayService>;
  let handlerFunction: ReturnType<typeof handler>;

  beforeEach(() => {
    mockUpdateCalendarDayService = vi.fn();
    handlerFunction = handler(mockUpdateCalendarDayService);
  });

  const day = '2025-10-11';
  const body = testDataFactory.calendar.day.request.workday();
  const expiresIn = 3600;
  const handlerEvent = {
    body: JSON.stringify(body),
    pathParameters: {
      day,
    } as AWSLambda.APIGatewayProxyEventPathParameters,
    headers: {
      [headerExpiresIn]: `${expiresIn}`,
    } as AWSLambda.APIGatewayProxyEventHeaders,
  } as AWSLambda.APIGatewayProxyEvent;

  it('should handle business service error', async () => {
    const statusCode = 418;
    const message = 'This is an error';
    mockUpdateCalendarDayService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockUpdateCalendarDayService, {
      day,
      body,
      expiresIn,
    });
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
    expect.assertions(3);
  });

  it('should respond with success', async () => {
    mockUpdateCalendarDayService.mockResolvedValue(undefined);

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockUpdateCalendarDayService, {
      day,
      body,
      expiresIn,
    });
    expect(response.statusCode).toEqual(204);
    expect.assertions(2);
  });
});
