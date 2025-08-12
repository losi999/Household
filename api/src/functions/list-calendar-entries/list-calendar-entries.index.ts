import { default as handler } from '@household/api/functions/list-calendar-entries/list-calendar-entries.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { listCalendarEntriesServiceFactory } from '@household/api/functions/list-calendar-entries/list-calendar-entries.service';
import { default as index } from '@household/api/handlers/index.handler';
import { default as queryStringParameters } from '@household/shared/schemas/date-range';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';
import { authorizer } from '@household/api/dependencies/handlers/authorizer.handler';
import { UserType } from '@household/shared/enums';
import { calendarEntryService } from '@household/shared/dependencies/services/calendar-entry-service';
import { calendarEntryDocumentConverter } from '@household/shared/dependencies/converters/calendar-entry-document-converter';

const listCalendarEntriesService = listCalendarEntriesServiceFactory(calendarEntryService, calendarEntryDocumentConverter);

export default index({
  handler: handler(listCalendarEntriesService),
  before: [
    authorizer(UserType.Hairdresser),
    apiRequestValidator({
      queryStringParameters,
    }),
  ],
  after: [cors],
});
