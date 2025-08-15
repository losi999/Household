import { Calendar } from '@household/shared/types/types';
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

export const selectCaledarDays = ({ dateFrom, dateTo }: Calendar.DateRange) => createSelector(selectHairdressing, ({ calendarDays }) => {
  return calendarDays ? Object.keys(calendarDays)?.filter(d => dateFrom <= d && dateTo >= d)
    .map(d => calendarDays[d]) : [];
});
