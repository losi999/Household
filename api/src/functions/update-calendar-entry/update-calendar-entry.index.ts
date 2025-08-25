import { default as handler } from '@household/api/functions/update-calendar-entry/update-calendar-entry.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { updateCalendarEntryServiceFactory } from '@household/api/functions/update-calendar-entry/update-calendar-entry.service';
import { calendarEntryDocumentConverter } from '@household/shared/dependencies/converters/calendar-entry-document-converter';
import { default as pathParameters } from '@household/shared/schemas/calendar-entry-id';
import { default as body } from '@household/shared/schemas/calendar-entry-request';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';
import { calendarEntryService } from '@household/shared/dependencies/services/calendar-entry-service';
import { default as index } from '@household/api/handlers/index.handler';
import { authorizer } from '@household/api/dependencies/handlers/authorizer.handler';
import { UserType } from '@household/shared/enums';
import { customerService } from '@household/shared/dependencies/services/customer-service';
import { priceService } from '@household/shared/dependencies/services/price-service';

const updateCalendarEntryService = updateCalendarEntryServiceFactory(calendarEntryService, calendarEntryDocumentConverter, customerService, priceService);

export default index({
  handler: handler(updateCalendarEntryService),
  before: [
    authorizer(UserType.Hairdresser),
    apiRequestValidator({
      body,
      pathParameters,
    }),
  ],
  after: [cors],
});
