import { errorResponse, okResponse } from '@household/api/common/response-factory';
import { IGetCalendarEntryService } from '@household/api/functions/get-calendar-entry/get-calendar-entry.service';
import { castPathParameters } from '@household/shared/common/aws-utils';
import { Calendar } from '@household/shared/types/types';

export default (getCalendarEntry: IGetCalendarEntryService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const { calendarEntryId } = castPathParameters(event);

    let calendarEntry: Calendar.Entry.Response;
    try {
      calendarEntry = await getCalendarEntry({
        calendarEntryId,
      });
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return okResponse(calendarEntry);
  };
};
