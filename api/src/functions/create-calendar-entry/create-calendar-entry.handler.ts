import { errorResponse, createdResponse } from '@household/api/common/response-factory';
import { ICreateCalendarEntryService } from '@household/api/functions/create-calendar-entry/create-calendar-entry.service';
import { getExpiresInHeader } from '@household/shared/common/aws-utils';
import { Calendar } from '@household/shared/types/types';

export default (createCalendarEntry: ICreateCalendarEntryService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const body = JSON.parse(event.body);

    let calendarEntryId: Calendar.Entry.Id;
    try {
      calendarEntryId = await createCalendarEntry({
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
