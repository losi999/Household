import { Clean } from '@household/shared/types/common';
import { Account } from '@household/shared/types/types';
import { createReducer, on } from '@ngrx/store';
import { accountApiActions } from '@household/web/state/account/account.actions';

export const accountReducer = createReducer<Clean<Account.Response>[]>([],
  on(accountApiActions.listAccountsCompleted, (_state, { accounts }) => {
    return accounts;
  }),
);
