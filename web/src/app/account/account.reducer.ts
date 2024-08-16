import { createReducer, on } from '@ngrx/store';
import { accountApiActions } from 'src/app/account/account.actions';

export const accountReducer = createReducer([],
  on(accountApiActions.retrievedAccountList, (_state, { accounts }) => {
    return accounts;
  }),
);
