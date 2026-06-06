import { inject, InjectionToken, ValueProvider } from '@angular/core';
import { withCalendarApiEvents } from '@hairdressing/state/calendar/with-calendar-api-events';
import { withCalendarEvents } from '@hairdressing/state/calendar/with-calendar-events';
import { withCalendarReducer } from '@hairdressing/state/calendar/with-calendar-reducer';
import { LimitedCalendarDay } from '@hairdressing/types';
import { signalStore, withState } from '@ngrx/signals';

const CALENDAR_STORE_INITIAL_STATE = new InjectionToken<CalendarState>('CALENDAR_STORE_INITIAL_STATE');

export type CalendarState = {
  days: {
    [date: string]: LimitedCalendarDay;
  }
};

export const provideCalendarStoreInitialState = (state: CalendarState = {
  days: {},
}): ValueProvider => {
  return {
    provide: CALENDAR_STORE_INITIAL_STATE,
    useValue: state,
  };
};

export const CalendarStore = signalStore({
  providedIn: 'root',
},
withState<CalendarState>(() => {
  const initialState = inject(CALENDAR_STORE_INITIAL_STATE);

  return initialState;
}),
withCalendarReducer(),
withCalendarApiEvents(),
withCalendarEvents(),
);
