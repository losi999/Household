import { default as handler } from '@household/api/functions/get-calendar-entry/get-calendar-entry.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { getCalendarEntryServiceFactory } from '@household/api/functions/get-calendar-entry/get-calendar-entry.service';
import { calendarEntryDocumentConverter } from '@household/shared/dependencies/converters/calendar-entry-document-converter';
import { default as pathParameters } from '@household/shared/schemas/calendar-entry-id';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';
import { calendarEntryService } from '@household/shared/dependencies/services/calendar-entry-service';
import { default as index } from '@household/api/handlers/index.handler';
import { authorizer } from '@household/api/dependencies/handlers/authorizer.handler';
import { UserType } from '@household/shared/enums';

const getCalendarEntryService = getCalendarEntryServiceFactory(calendarEntryService, calendarEntryDocumentConverter);

export default index({
  handler: handler(getCalendarEntryService),
  before: [
    authorizer(UserType.Hairdresser),
    apiRequestValidator({
      pathParameters,
    }),
  ],
  after: [cors],
});
