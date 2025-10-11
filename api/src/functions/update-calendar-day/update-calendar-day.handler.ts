import { errorResponse, noContentResponse } from '@household/api/common/response-factory';
import { IUpdateCalendarDayService } from '@household/api/functions/update-calendar-day/update-calendar-day.service';
import { castPathParameters, getExpiresInHeader } from '@household/shared/common/aws-utils';

export default (updateCalendarDay: IUpdateCalendarDayService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const body = JSON.parse(event.body);
    const { day } = castPathParameters(event);

    try {
      await updateCalendarDay({
        day,
        body,
        expiresIn: Number(getExpiresInHeader(event)),
      });
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return noContentResponse();
  };
};
