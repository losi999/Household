import { default as handler } from '@household/api/functions/list-customer-works/list-customer-works.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { listCustomerWorksServiceFactory } from '@household/api/functions/list-customer-works/list-customer-works.service';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';
import { default as pathParameters } from '@household/shared/schemas/customer-id';
import { customerService } from '@household/shared/dependencies/services/customer-service';
import { default as index } from '@household/api/handlers/index.handler';
import { authorizer } from '@household/api/dependencies/handlers/authorizer.handler';
import { UserType } from '@household/shared/enums';
import { calendarEntryService } from '@household/shared/dependencies/services/calendar-entry-service';
import { calendarEntryDocumentConverter } from '@household/shared/dependencies/converters/calendar-entry-document-converter';
import { mongoDisconnect } from '@household/api/dependencies/handlers/mongo-disconnect.handler';

const listCustomerWorksService = listCustomerWorksServiceFactory(customerService, calendarEntryService, calendarEntryDocumentConverter);

export default index({
  handler: handler(listCustomerWorksService),
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
