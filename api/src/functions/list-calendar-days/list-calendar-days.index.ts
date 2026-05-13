import { default as handler } from '@household/api/functions/list-calendar-days/list-calendar-days.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { listCalendarDaysServiceFactory } from '@household/api/functions/list-calendar-days/list-calendar-days.service';
import { default as index } from '@household/api/handlers/index.handler';
import { default as queryStringParameters } from '@household/shared/schemas/date-range';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';
import { authorizer } from '@household/api/dependencies/handlers/authorizer.handler';
import { UserType } from '@household/shared/enums';
import { calendarEntryService } from '@household/shared/dependencies/services/calendar-entry-service';
import { calendarDayDocumentConverter } from '@household/shared/dependencies/converters/calendar-day-document-converter';
import { calendarDayService } from '@household/shared/dependencies/services/calendar-day-service';
import { mongoDisconnect } from '@household/api/dependencies/handlers/mongo-disconnect.handler';

const listCalendarDaysService = listCalendarDaysServiceFactory(calendarEntryService, calendarDayService, calendarDayDocumentConverter);

export default index({
  handler: handler(listCalendarDaysService),
  before: [
    authorizer(UserType.Hairdresser),
    apiRequestValidator({
      queryStringParameters,
    }),
  ],
  after: [
    cors,
    mongoDisconnect,
  ],
});
