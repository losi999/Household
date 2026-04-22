import { calendarDayService } from '@household/shared/dependencies/services/calendar-day-service';
import { ICalendarDayService } from '@household/shared/services/calendar-day-service';
import { test as baseTest } from '@household/test/fixtures/logging.fixture';

export const test = baseTest.extend<Pick<ICalendarDayService, 'saveCalendarDay' | 'findCalendarDayByDay' | 'clearCalendarDay'>>({
  saveCalendarDay: async ({ logDbCall }, use) => {
    const saveCalendarDay: ICalendarDayService['saveCalendarDay'] = async (calendarDay) => {
      const result = await calendarDayService.saveCalendarDay(calendarDay);
      await logDbCall('saveCalendarDay', {
        calendarDay,
      }, result);
      return result;
    };

    await use(saveCalendarDay);
  },
  findCalendarDayByDay: async ({ logDbCall }, use) => {
    const findCalendarDayByDay: ICalendarDayService['findCalendarDayByDay'] = async (day) => {
      const result = await calendarDayService.findCalendarDayByDay(day);
      await logDbCall('findCalendarDayByDay', {
        day,
      }, result);
      return result;
    };

    await use(findCalendarDayByDay);
  },
  clearCalendarDay: async ({ logDbCall }, use) => {
    const clearCalendarDay: ICalendarDayService['clearCalendarDay'] = async (day) => {
      const result = await calendarDayService.clearCalendarDay(day);
      await logDbCall('clearCalendarDay', {
        day,
      }, result);
      return result;
    };

    await use(clearCalendarDay);
  },
});
