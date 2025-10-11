import { errorResponse, createdResponse } from '@household/api/common/response-factory';
import { IPayCalendarWorkEntryService } from '@household/api/functions/pay-calendar-work-entry/pay-calendar-work-entry.service';
import { castPathParameters } from '@household/shared/common/aws-utils';
import { Transaction } from '@household/shared/types/types';

export default (payCalendarWorkEntry: IPayCalendarWorkEntryService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const body = JSON.parse(event.body);
    const { calendarEntryId } = castPathParameters(event);

    let transactionId: Transaction.Id;
    try {
      transactionId = await payCalendarWorkEntry({
        body,
        calendarEntryId,
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
