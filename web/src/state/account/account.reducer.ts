import { Clean } from '@household/shared/types/common';
import { Account } from '@household/shared/types/types';
import { createReducer, on } from '@ngrx/store';
import { accountApiActions } from '@household/web/state/account/account.actions';

export const accountReducer = createReducer<Clean<Account.Response>[]>([],
  on(accountApiActions.listAccountsCompleted, (_state, { accounts }) => {
    return accounts;
  }),
  on(accountApiActions.createAccountCompleted, (_state, { accountId, accountType, currency, name, owner }) => {

    return _state.filter(a => a.accountId !== accountId)
      .concat({
        accountId,
        accountType,
        currency,
        name,
        owner,
        balance: 0,
        deferredCount: 0,
        fullName: `${name} (${owner})`,
        isOpen: true,
      });
  }),

  on(accountApiActions.updateAccountCompleted, (_state, { accountId, accountType, currency, name, owner }) => {

    const { balance, deferredCount, isOpen } = _state.find(a => a.accountId === accountId);

    return _state.filter(a => a.accountId !== accountId)
      .concat({
        accountId,
        accountType,
        currency,
        name,
        owner,
        balance,
        deferredCount,
        fullName: `${name} (${owner})`,
        isOpen,
      });
  }),

  on(accountApiActions.deleteAccountCompleted, (_state, { accountId }) => {
    return _state.filter(a => a.accountId !== accountId);
  }),
);
