import { testDataFactory } from '@household/shared/common/test-data-factory';
import { addDays, dateToISODateString } from '@household/shared/common/utils';
import { CalendarState } from '@household/web/app/hairdressing/calendar/state/calendar.reducer';
import { selectCalendarDay, selectCalendarWeek } from '@household/web/app/hairdressing/calendar/state/calendar.selector';
import { LimitedCalendarDay } from '@household/web/types/common';

describe('Calendar selector', () => {
  let state: CalendarState;

  describe('Select calendar day', () => {
    it('should return calendar day', () => {
      const date = new Date();
      const dayResponse = testDataFactory.calendar.day.response.vacation();
      state = {
        [dateToISODateString(date)]: {
          ...dayResponse,
          calculatedStart: undefined,
          calculatedEnd: undefined,
        },
      };
      const result = selectCalendarDay(date)({
        calendar: state,
      });
      expect(result).toEqual({
        ...dayResponse,
        calculatedStart: undefined,
        calculatedEnd: undefined,
      });
      
    });
  });

  describe('Select calendar week', () => {
    it('should return calendar week with earliest and latest entries calculated', () => {
      const weekStart = new Date();
      const earliestStart = 1;
      const latestEnd = 95;
            
      const day8: LimitedCalendarDay = {
        ...testDataFactory.calendar.day.response.vacation({
          day: dateToISODateString(addDays(8, weekStart)),
          entries: [
            testDataFactory.calendar.entry.response.personal({
              start: earliestStart - 1,
              end: latestEnd + 1,
            }),
          ],
        }),
        calculatedEnd: undefined,
        calculatedStart: undefined,
      };

      const day1: LimitedCalendarDay = {
        ...testDataFactory.calendar.day.response.vacation({
          day: dateToISODateString(weekStart),
          entries: [
            testDataFactory.calendar.entry.response.personal({
              start: earliestStart,
            }),
          ],
        }),
        calculatedEnd: undefined,
        calculatedStart: undefined,
      };

      const day2: LimitedCalendarDay = {
        ...testDataFactory.calendar.day.response.vacation({
          day: dateToISODateString(addDays(1, weekStart)),
          entries: [
            testDataFactory.calendar.entry.response.personal({
              end: latestEnd,
            }),
          ],
        }),
        calculatedEnd: undefined,
        calculatedStart: undefined,
      };

      state = {
        [day1.day]: day1,
        [day2.day]: day2,
        [day8.day]: day8,        
      };

      const result = selectCalendarWeek(weekStart)({
        calendar: state,
      });
      expect(result).toEqual({
        start: earliestStart,
        end: latestEnd,
        days: {
          [day1.day]: day1,
          [day2.day]: day2,
        },
      });
    });
  });
});
