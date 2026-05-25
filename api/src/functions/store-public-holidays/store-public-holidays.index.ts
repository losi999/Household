import { default as handler } from '@household/api/functions/store-public-holidays/store-public-holidays.handler';
import { storePublicHolidaysServiceFactory } from '@household/api/functions/store-public-holidays/store-public-holidays.service';
import { default as index } from '@household/api/handlers/index.handler';
import { calendarDayService } from '@household/shared/dependencies/services/calendar-day-service';

const storePublicHolidaysService = storePublicHolidaysServiceFactory(calendarDayService);

export default index({
  handler: handler(storePublicHolidaysService),
  before: [],
  after: [],
});
