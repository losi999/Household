import { addDays, dateToISODateString } from '@household/shared/common/utils';
import { WORKDAY_END, WORKDAY_START } from '@household/shared/constants';
import { CalendarWeek } from '@household/web/app/hairdressing/hairdressing-calendar-home/hairdressing-calendar-home.component';
import { HairdressingState } from '@household/web/state/hairdressing/hairdressing.reducer';
import { createFeatureSelector, createSelector } from '@ngrx/store';

const selectHairdressing = createFeatureSelector<HairdressingState>('hairdressing');

export const selectIncomeByMonth = (month: string) => createSelector(selectHairdressing, ({ income }) => {
  return income?.[month];
});

export const selectPriceList = createSelector(selectHairdressing, ({ priceList }) => {
  return priceList;
});

export const selectCalendarDay = (day: string) => createSelector(selectHairdressing, ({ calendarDays }) => {
  return calendarDays?.[day];
});

export const selectCalendarWeek = (date: Date) => createSelector<object, HairdressingState, CalendarWeek>(selectHairdressing, ({ calendarDays }) => {
  const weekday = date.getDay();
  const diffToMonday = weekday === 0 ? 6 : weekday - 1;
  return Array.from({
    length: 7, 
  }, (_, i) => i).reduce<CalendarWeek>((accumulator, _, index) => {
    const d = dateToISODateString(addDays(index - diffToMonday, date));
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

export const selectCalendarEntry = createSelector(selectHairdressing, ({ selectedEntry }) => {
  return selectedEntry;
});
