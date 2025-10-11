import { mongodbService } from '@household/shared/dependencies/services/mongodb-service';
import { calendarEntryServiceFactory } from '@household/shared/services/calendar-entry-service';

export const calendarEntryService = calendarEntryServiceFactory(mongodbService);
