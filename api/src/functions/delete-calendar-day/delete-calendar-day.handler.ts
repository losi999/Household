import { errorResponse, noContentResponse } from '@household/api/common/response-factory';
import { IDeleteCalendarDayService } from '@household/api/functions/delete-calendar-day/delete-calendar-day.service';
import { castPathParameters } from '@household/shared/common/aws-utils';

export default (deleteCalendarDay: IDeleteCalendarDayService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const { day } = castPathParameters(event);

    try {
      await deleteCalendarDay({
        day,
      });
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return noContentResponse();
  };
};
