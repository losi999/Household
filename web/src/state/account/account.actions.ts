import { Account } from '@household/shared/types/types';
import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const accountApiActions = createActionGroup({
  source: 'Account API',
  events: {
    'List accounts initiated': emptyProps(),
    'List accounts completed': props<{accounts: Account.Response[]}>(),
    'Create account initiated': props<Account.Request>(),
    'Create account completed': props<Account.AccountId & Account.Request>(),
    'Update account initiated': props<Account.AccountId & Account.Request>(),
    'Update account completed': props<Account.AccountId & Account.Request>(),
    'Delete account initiated': props<Account.AccountId>(),
    'Delete account completed': props<Account.AccountId>(),
    'Delete account failed': props<Account.AccountId>(),
  },
});
