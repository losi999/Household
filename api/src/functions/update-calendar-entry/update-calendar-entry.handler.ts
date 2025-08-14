import { errorResponse, createdResponse } from '@household/api/common/response-factory';
import { IUpdateCalendarEntryService } from '@household/api/functions/update-calendar-entry/update-calendar-entry.service';
import { castPathParameters, getExpiresInHeader } from '@household/shared/common/aws-utils';

export default (updateCalendarEntry: IUpdateCalendarEntryService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const body = JSON.parse(event.body);
    const { calendarEntryId } = castPathParameters(event);

    try {
      await updateCalendarEntry({
        calendarEntryId,
        body,
        expiresIn: Number(getExpiresInHeader(event)),
      });
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return createdResponse({
      calendarEntryId,
    });
  };
};
