import { type } from '@ngrx/signals';
import { eventGroup } from '@ngrx/signals/events';

export const navigationEvents = eventGroup({
  source: 'Navigation',
  events: {
    loggedInHomepage: type<void>(),
    loggedOutHomepage: type<void>(),
    changeCalendarWeek: type<{
      year?: number;
      week?: number;
      weekOf?: string;
    }>(),
  },
});
