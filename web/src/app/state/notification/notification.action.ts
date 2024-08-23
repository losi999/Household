import { createActionGroup, props } from '@ngrx/store';

export const notificationActions = createActionGroup({
  source: 'Notification',
  events: {
    'Show error': props<{message: string}>(),
  },
});
