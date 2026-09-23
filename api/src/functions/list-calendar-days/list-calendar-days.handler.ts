
import { errorResponse, okResponse } from '@household/api/common/response-factory';
import { IListCalendarDaysService } from '@household/api/functions/list-calendar-days/list-calendar-days.service';
import { Responses } from '@household/shared/types/responses';

export default (listCalendarDays: IListCalendarDaysService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const { dateFrom, dateTo } = event.queryStringParameters;

    let days: Responses.CalendarDay[];
    try {
      days = await listCalendarDays({
        dateFrom,
        dateTo,
      });
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return okResponse(days);
  };
};
