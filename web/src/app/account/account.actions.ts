import { Account } from '@household/shared/types/types';
import { createActionGroup, props } from '@ngrx/store';

export const accountApiActions = createActionGroup({
  source: 'Account API',
  events: {
    'Retrieved account list': props<{accounts: Account.Response[]}>(),
  },
});
