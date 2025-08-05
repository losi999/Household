import { Account } from '@household/shared/types/types';
import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const navigationActions = createActionGroup({
  source: 'Navigation',
  events: {
    'Logged in homepage': emptyProps(),
    'Logged out homepage': emptyProps(),
    'Transaction list of account': props<Account.AccountId>(),
  },
});
