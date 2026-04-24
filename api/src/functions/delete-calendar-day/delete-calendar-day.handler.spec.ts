import { MockBusinessService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { default as handler } from '@household/api/functions/delete-calendar-day/delete-calendar-day.handler';
import { IDeleteCalendarDayService } from '@household/api/functions/delete-calendar-day/delete-calendar-day.service';
describe('Delete calendar day handler', () => {
  let mockDeleteCalendarDayService: MockBusinessService<IDeleteCalendarDayService>;
  let handlerFunction: ReturnType<typeof handler>;

  beforeEach(() => {
    mockDeleteCalendarDayService = vi.fn();
    handlerFunction = handler(mockDeleteCalendarDayService);
  });

  const day = '2025-10-11';
  const handlerEvent = {
    pathParameters: {
      day,
    } as AWSLambda.APIGatewayProxyEventPathParameters,
  } as AWSLambda.APIGatewayProxyEvent;

  it('should handle business service error', async () => {
    const statusCode = 418;
    const message = 'This is an error';
    mockDeleteCalendarDayService.mockRejectedValue({
      statusCode,
      message,
    });

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockDeleteCalendarDayService, {
      day,
    });
    expect(response.statusCode).toEqual(statusCode);
    expect(JSON.parse(response.body).message).toEqual(message);
    expect.assertions(3);
  });

  it('should respond with success', async () => {
    mockDeleteCalendarDayService.mockResolvedValue(undefined);

    const response = await handlerFunction(handlerEvent, undefined, undefined) as AWSLambda.APIGatewayProxyResult;
    validateFunctionCall(mockDeleteCalendarDayService, {
      day,
    });
    expect(response.statusCode).toEqual(204);
    expect.assertions(2);
  });
});
