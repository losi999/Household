import { calendarEntryService } from '@household/shared/dependencies/services/calendar-entry-service';
import { ICalendarEntryService } from '@household/shared/services/calendar-entry-service';
import { test as baseTest } from '@household/test/fixtures/logging.fixture';

export const test = baseTest.extend<Pick<ICalendarEntryService, 'saveCalendarEntry' | 'getCalendarEntryById'>>({
  saveCalendarEntry: async ({ logServiceCall }, use) => {
    const saveCalendarEntry: ICalendarEntryService['saveCalendarEntry'] = async (calendarEntry) => {
      const result = await calendarEntryService.saveCalendarEntry(calendarEntry);
      await logServiceCall('saveCalendarEntry', {
        calendarEntry,
      }, result);
      return result;
    };

    await use(saveCalendarEntry);
  },
  getCalendarEntryById: async ({ logServiceCall }, use) => {
    const getCalendarEntryById: ICalendarEntryService['getCalendarEntryById'] = async (calendarEntryId) => {
      const result = await calendarEntryService.getCalendarEntryById(calendarEntryId);
      await logServiceCall('getCalendarEntryById', {
        calendarEntryId,
      }, result);
      return result;
    };

    await use(getCalendarEntryById);
  },
});
