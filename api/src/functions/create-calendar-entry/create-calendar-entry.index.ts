import { default as handler } from '@household/api/functions/create-calendar-entry/create-calendar-entry.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';
import { default as body } from '@household/shared/schemas/calendar-entry-request';
import { default as index } from '@household/api/handlers/index.handler';
import { authorizer } from '@household/api/dependencies/handlers/authorizer.handler';
import { UserType } from '@household/shared/enums';
import { createCalendarEntryServiceFactory } from '@household/api/functions/create-calendar-entry/create-calendar-entry.service';
import { calendarEntryDocumentConverter } from '@household/shared/dependencies/converters/calendar-entry-document-converter';
import { calendarEntryService } from '@household/shared/dependencies/services/calendar-entry-service';

const createCalendarEntryService = createCalendarEntryServiceFactory(calendarEntryService, calendarEntryDocumentConverter);

export default index({
  handler: handler(createCalendarEntryService),
  before: [
    authorizer(UserType.Hairdresser),
    apiRequestValidator({
      body,
    }),
  ],
  after: [cors],
});
