import { createActionGroup, props } from '@ngrx/store';

export const notificationActions = createActionGroup({
  source: 'Notification',
  events: {
    'Show message': props<{message: string}>(),
  },
});
