import { withCalendarApiEvents } from '@hairdressing/state/calendar/with-calendar-api-events';
import { withCalendarEvents } from '@hairdressing/state/calendar/with-calendar-events';
import { withCalendarReducer } from '@hairdressing/state/calendar/with-calendar-reducer';
import { LimitedCalendarDay } from '@hairdressing/types';
import { signalStore, withState } from '@ngrx/signals';

export type CalendarState = {
  days: {
    [date: string]: LimitedCalendarDay;
  }
};

export const CalendarStore = signalStore({
  providedIn: 'root',
},
withState<CalendarState>({
  days: {},
}),
withCalendarReducer(),
withCalendarApiEvents(),
withCalendarEvents(),
);
