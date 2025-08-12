
import { errorResponse, okResponse } from '@household/api/common/response-factory';
import { IListCalendarEntriesService } from '@household/api/functions/list-calendar-entries/list-calendar-entries.service';
import { CalendarEntry } from '@household/shared/types/types';

export default (listCalendarEntries: IListCalendarEntriesService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const { dateFrom, dateTo } = event.queryStringParameters;

    let entries: CalendarEntry.Response[];
    try {
      entries = await listCalendarEntries({
        dateFrom,
        dateTo,
      });
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return okResponse(entries);
  };
};
