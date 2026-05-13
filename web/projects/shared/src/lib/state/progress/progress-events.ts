import { type } from '@ngrx/signals';
import { eventGroup } from '@ngrx/signals/events';

export const progressEvents = eventGroup({
  source: 'Progress',
  events: {
    processStarted: type<void>(),
    processFinished: type<void>(),
  },
});

