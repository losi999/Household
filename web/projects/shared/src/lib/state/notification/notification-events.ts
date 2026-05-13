import { type } from '@ngrx/signals';
import { eventGroup } from '@ngrx/signals/events';

export const notificationEvents = eventGroup({
  source: 'Notification',
  events: {
    showMessage: type<string>(),
  },
});
