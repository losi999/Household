import { addDays, dateToISODateString } from '@household/shared/common/utils';
import { WORKDAY_END, WORKDAY_START } from '@household/shared/constants';
import { CalendarWeek } from '@household/web/app/hairdressing/calendar/calendar-home/calendar-home.component';
import { CalendarState } from '@household/web/app/hairdressing/calendar/state/calendar.reducer';
import { createFeatureSelector, createSelector } from '@ngrx/store';

const selectCalendar = createFeatureSelector<CalendarState>('calendar');

export const selectCalendarDay = (day: string) => createSelector(selectCalendar, ({ calendarDays }) => {
  return calendarDays?.[day];
});

export const selectCalendarWeek = (weekStart: Date) => createSelector<object, CalendarState, CalendarWeek>(selectCalendar, ({ calendarDays }) => {
  return Array.from({
    length: 7, 
  }, (_, i) => i).reduce<CalendarWeek>((accumulator, _, index) => {
    const d = dateToISODateString(addDays(index, weekStart));
    const day = calendarDays?.[d];

    if (day) {
      let min = accumulator.start;
      let max = accumulator.end;
      day.entries.forEach((e) => {
        if (e.start < min) {
          min = e.start;
        }
        if (e.end > max) {
          max = e.end;
        }
      });

      return {
        start: min,
        end: max,
        days: [
          ...accumulator.days,
          day,
        ],
      };
    }

    return accumulator;
  }, {
    start: WORKDAY_START,
    end: WORKDAY_END,
    days: [],
  });
});
