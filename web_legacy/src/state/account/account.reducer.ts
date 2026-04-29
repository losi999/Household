import { Account } from '@household/shared/types/types';
import { createReducer, on } from '@ngrx/store';
import { accountApiActions } from '@household/web/state/account/account.actions';

export const accountReducer = createReducer<Account.Response[]>([],
  on(accountApiActions.listAccountsCompleted, (_state, { accounts }) => {
    return accounts;
  }),
  on(accountApiActions.createAccountCompleted, accountApiActions.updateAccountCompleted, (_state, { accountId, accountType, currency, name, owner }) => {

    const exisingAccount = _state.find(a => a.accountId === accountId);

    return _state.filter(a => a.accountId !== accountId)
      .concat({
        accountId,
        accountType,
        currency,
        name,
        owner,
        balance: exisingAccount ? exisingAccount.balance : 0,
        fullName: `${name} (${owner})`,
        isOpen: exisingAccount ? exisingAccount.isOpen : true,
      });
  }),

  on(accountApiActions.deleteAccountCompleted, (_state, { accountId }) => {
    return _state.filter(a => a.accountId !== accountId);
  }),

  on(accountApiActions.getAccountCompleted, (_state, { account }) => {

    const exisingAccount = _state.find(a => a.accountId === account.accountId);

    if (exisingAccount) {
      return _state;
    }

    return [
      ..._state,
      account,
    ];
  }),
);
