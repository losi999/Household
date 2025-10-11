
import { errorResponse, okResponse } from '@household/api/common/response-factory';
import { IListCalendarDaysService } from '@household/api/functions/list-calendar-days/list-calendar-days.service';
import { Calendar } from '@household/shared/types/types';

export default (listCalendarDays: IListCalendarDaysService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const { dateFrom, dateTo } = event.queryStringParameters;

    let days: Calendar.Day.Response[];
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
