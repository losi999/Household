import { default as handler } from '@household/api/functions/update-calendar-day/update-calendar-day.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { default as pathParameters } from '@household/shared/schemas/calendar-day';
import { default as body } from '@household/shared/schemas/calendar-day-request';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';
import { default as index } from '@household/api/handlers/index.handler';
import { authorizer } from '@household/api/dependencies/handlers/authorizer.handler';
import { UserType } from '@household/shared/enums';
import { updateCalendarDayServiceFactory } from '@household/api/functions/update-calendar-day/update-calendar-day.service';
import { calendarDayDocumentConverter } from '@household/shared/dependencies/converters/calendar-day-document-converter';
import { calendarDayService } from '@household/shared/dependencies/services/calendar-day-service';
import { mongoDisconnect } from '@household/api/dependencies/handlers/mongo-disconnect.handler';

const updateCalendarDayService = updateCalendarDayServiceFactory(calendarDayService, calendarDayDocumentConverter);

export default index({
  handler: handler(updateCalendarDayService),
  before: [
    authorizer(UserType.Hairdresser),
    apiRequestValidator({
      body,
      pathParameters,
    }),
  ],
  after: [
    cors,
    mongoDisconnect,
  ],
});
