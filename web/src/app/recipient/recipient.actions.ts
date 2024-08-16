import { Recipient } from '@household/shared/types/types';
import { createActionGroup, props } from '@ngrx/store';

export const recipientApiActions = createActionGroup({
  source: 'Recipient API',
  events: {
    'Retrieved recipient list': props<{recipients: Recipient.Response[]}>(),
  },
});
