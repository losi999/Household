import { calendarEntryService } from '@household/shared/dependencies/services/calendar-entry-service';
import { ICalendarEntryService } from '@household/shared/services/calendar-entry-service';
import { test as baseTest } from '@household/test/fixtures/logging.fixture';

export const test = baseTest.extend<Pick<ICalendarEntryService, 'saveCalendarEntry' | 'getCalendarEntryById'>>({
  saveCalendarEntry: async ({ logDbCall }, use) => {
    const saveCalendarEntry: ICalendarEntryService['saveCalendarEntry'] = async (calendarEntry) => {
      const result = await calendarEntryService.saveCalendarEntry(calendarEntry);
      await logDbCall('saveCalendarEntry', {
        calendarEntry,
      }, result);
      return result;
    };

    await use(saveCalendarEntry);
  },
  getCalendarEntryById: async ({ logDbCall }, use) => {
    const getCalendarEntryById: ICalendarEntryService['getCalendarEntryById'] = async (calendarEntryId) => {
      const result = await calendarEntryService.getCalendarEntryById(calendarEntryId);
      await logDbCall('getCalendarEntryById', {
        calendarEntryId,
      }, result);
      return result;
    };

    await use(getCalendarEntryById);
  },
});
