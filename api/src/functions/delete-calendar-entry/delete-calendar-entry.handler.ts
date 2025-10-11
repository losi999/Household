import { errorResponse, noContentResponse } from '@household/api/common/response-factory';
import { IDeleteCalendarEntryService } from '@household/api/functions/delete-calendar-entry/delete-calendar-entry.service';
import { castPathParameters } from '@household/shared/common/aws-utils';

export default (deleteCalendarEntry: IDeleteCalendarEntryService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const { calendarEntryId } = castPathParameters(event);

    try {
      await deleteCalendarEntry({
        calendarEntryId,
      });
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return noContentResponse();
  };
};
