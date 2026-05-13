import { default as handler } from '@household/api/functions/delete-calendar-day/delete-calendar-day.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { deleteCalendarDayServiceFactory } from '@household/api/functions/delete-calendar-day/delete-calendar-day.service';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';
import { default as pathParameters } from '@household/shared/schemas/calendar-day';
import { calendarDayService } from '@household/shared/dependencies/services/calendar-day-service';
import { default as index } from '@household/api/handlers/index.handler';
import { authorizer } from '@household/api/dependencies/handlers/authorizer.handler';
import { UserType } from '@household/shared/enums';
import { mongoDisconnect } from '@household/api/dependencies/handlers/mongo-disconnect.handler';

const deleteCalendarDayService = deleteCalendarDayServiceFactory(calendarDayService);

export default index({
  handler: handler(deleteCalendarDayService),
  before: [
    authorizer(UserType.Hairdresser),
    apiRequestValidator({
      pathParameters,
    }),
  ],
  after: [
    cors,
    mongoDisconnect,
  ],
});
