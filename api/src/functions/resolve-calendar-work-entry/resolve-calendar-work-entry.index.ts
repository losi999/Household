import { default as handler } from '@household/api/functions/resolve-calendar-work-entry/resolve-calendar-work-entry.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';
import { default as body } from '@household/shared/schemas/calendar-entry-resolution-request';
import { default as pathParameters } from '@household/shared/schemas/calendar-entry-id';
import { default as index } from '@household/api/handlers/index.handler';
import { authorizer } from '@household/api/dependencies/handlers/authorizer.handler';
import { UserType } from '@household/shared/enums';
import { resolveCalendarWorkEntryServiceFactory } from '@household/api/functions/resolve-calendar-work-entry/resolve-calendar-work-entry.service';
import { calendarEntryService } from '@household/shared/dependencies/services/calendar-entry-service';
import { paymentTransactionDocumentConverter } from '@household/shared/dependencies/converters/payment-transaction-document-converter';
import { settingService } from '@household/shared/dependencies/services/setting-service';
import { accountService } from '@household/shared/dependencies/services/account-service';
import { categoryService } from '@household/shared/dependencies/services/category-service';
import { calendarEntryDocumentConverter } from '@household/shared/dependencies/converters/calendar-entry-document-converter';
import { mongoDisconnect } from '@household/api/dependencies/handlers/mongo-disconnect.handler';

const resolveCalendarWorkEntryService = resolveCalendarWorkEntryServiceFactory(calendarEntryService, paymentTransactionDocumentConverter, settingService, accountService, categoryService, calendarEntryDocumentConverter);

export default index({
  handler: handler(resolveCalendarWorkEntryService),
  before: [
    authorizer(UserType.Hairdresser),
    apiRequestValidator({
      pathParameters,
      body,
    }),
  ],
  after: [
    cors,
    mongoDisconnect,
  ],
});
