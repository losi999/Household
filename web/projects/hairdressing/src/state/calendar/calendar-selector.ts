import { CalendarState } from '@hairdressing/state/calendar/calendar-reducer';
import { CalendarWeek } from '@hairdressing/types';
import { addDays, dateToISODateString } from '@household/shared/common/utils';
import { WORKDAY_END, WORKDAY_START } from '@household/shared/constants';
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { Params } from '@angular/router';
import { selectQueryParams } from '@hairdressing/state/router/router-selector';
import { getISOWeek, startOfISOWeek, setISOWeek } from 'date-fns';

const calendarState = createFeatureSelector<CalendarState>('calendar');

export const selectCalendar = createSelector(calendarState, (calendarDays) => {
  return structuredClone(calendarDays);
});

export const selectCalendarWeek = createSelector<object, CalendarState, Params, CalendarWeek>(selectCalendar, selectQueryParams, (calendarDays, params) => {
  const weekOf = params.weekOf ? new Date(params.weekOf) : new Date();
  const year = params.year ?? weekOf.getFullYear();
  const week = params.week ?? getISOWeek(weekOf);

  const weekStart = startOfISOWeek(setISOWeek(new Date(year, 0), week));

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
        days: {
          ...accumulator.days,
          [d]: day,
        },
      };
    }
    
    return {
      ...accumulator,
      days: {
        ...accumulator.days,
        [d]: null,
      },
    };
  }, {
    start: WORKDAY_START,
    end: WORKDAY_END,
    days: {},
  });
});
