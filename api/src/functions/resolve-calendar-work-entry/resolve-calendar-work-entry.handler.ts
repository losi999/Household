import { errorResponse, createdResponse } from '@household/api/common/response-factory';
import { IResolveCalendarWorkEntryService } from '@household/api/functions/resolve-calendar-work-entry/resolve-calendar-work-entry.service';
import { castPathParameters, getExpiresInHeader } from '@household/shared/common/aws-utils';
import { Transaction } from '@household/shared/types/types';

export default (resolveCalendarWorkEntry: IResolveCalendarWorkEntryService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const body = JSON.parse(event.body);
    const { calendarEntryId } = castPathParameters(event);

    let transactionId: Transaction.Id;
    try {
      transactionId = await resolveCalendarWorkEntry({
        body,
        calendarEntryId,
        expiresIn: Number(getExpiresInHeader(event)),
      });
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return createdResponse({
      transactionId,
    });
  };
};
