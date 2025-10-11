import { mongodbService } from '@household/shared/dependencies/services/mongodb-service';
import { calendarDayServiceFactory } from '@household/shared/services/calendar-day-service';

export const calendarDayService = calendarDayServiceFactory(mongodbService);
