import { default as handler } from '@household/api/functions/delete-calendar-entry/delete-calendar-entry.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { deleteCalendarEntryServiceFactory } from '@household/api/functions/delete-calendar-entry/delete-calendar-entry.service';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';
import { default as pathParameters } from '@household/shared/schemas/calendar-entry-id';
import { calendarEntryService } from '@household/shared/dependencies/services/calendar-entry-service';
import { default as index } from '@household/api/handlers/index.handler';
import { authorizer } from '@household/api/dependencies/handlers/authorizer.handler';
import { UserType } from '@household/shared/enums';
import { mongoDisconnect } from '@household/api/dependencies/handlers/mongo-disconnect.handler';

const deleteCalendarEntryService = deleteCalendarEntryServiceFactory(calendarEntryService);

export default index({
  handler: handler(deleteCalendarEntryService),
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
