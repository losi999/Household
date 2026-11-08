import { toSearchable } from '@household/shared/common/utils';
import { accountApiEvents } from '@household/state/account/account-events';
import { AccountState } from '@household/state/account/account-store';
import { signalStoreFeature } from '@ngrx/signals';
import { on, withReducer } from '@ngrx/signals/events';

export const withAccountReducer = () => {
  return signalStoreFeature(
    withReducer<AccountState>(
      on(accountApiEvents.listAccountsCompleted, ({ payload }) => {
        return {
          accountList: payload.map(a => toSearchable(a, ['name'])),
        };
      }),
      on(accountApiEvents.updateAccountInitiated, accountApiEvents.deleteAccountInitiated, accountApiEvents.openAccountInitiated, accountApiEvents.closeAccountInitiated, ({ payload: { accountId } }) => {
        return (state) => {
          return {
            isInProgress: [
              ...state.isInProgress,
              accountId,
            ],
          };
        };
      }),
      on(accountApiEvents.updateAccountFailed, accountApiEvents.deleteAccountFailed, accountApiEvents.openAccountFailed, accountApiEvents.closeAccountFailed, ({ payload: { accountId } }) => {
        return (state) => {
          return {
            isInProgress: state.isInProgress.filter(id => id !== accountId),
          };
        };
      }),
      // The request does not contain whether the account is open and its balance, they stay as they were
      on(accountApiEvents.updateAccountCompleted, ({ payload: { accountId, name, currency, accountType } }) => {
        return (state) => {
          return {
            isInProgress: state.isInProgress.filter(id => id !== accountId),
            accountList: state.accountList
              .map((account) => {
                return account.accountId === accountId ? toSearchable({
                  accountId,
                  name,
                  currency,
                  accountType,
                  isOpen: account.isOpen,
                  balance: account.balance,
                }, ['name']) : account;
              })
              .toSorted((a, b) => a.name.localeCompare(b.name, 'hu', {
                sensitivity: 'base',
              })),
          };
        };
      }),
      on(accountApiEvents.deleteAccountCompleted, ({ payload: { accountId } }) => {
        return (state) => {
          return {
            isInProgress: state.isInProgress.filter(id => id !== accountId),
            accountList: state.accountList.filter(account => account.accountId !== accountId),
          };
        };
      }),
      on(accountApiEvents.openAccountCompleted, ({ payload: { accountId } }) => {
        return (state) => {
          return {
            isInProgress: state.isInProgress.filter(id => id !== accountId),
            accountList: state.accountList.map(account => account.accountId === accountId ? {
              ...account,
              isOpen: true,
            } : account),
          };
        };
      }),
      on(accountApiEvents.closeAccountCompleted, ({ payload: { accountId } }) => {
        return (state) => {
          return {
            isInProgress: state.isInProgress.filter(id => id !== accountId),
            accountList: state.accountList.map(account => account.accountId === accountId ? {
              ...account,
              isOpen: false,
            } : account),
          };
        };
      }),
      // A new account is open and has no transactions yet, so its balance is zero
      on(accountApiEvents.createAccountCompleted, ({ payload: { accountId, name, currency, accountType } }) => {
        return (state) => {
          return {
            accountList: state.accountList
              .concat(toSearchable({
                accountId,
                name,
                currency,
                accountType,
                isOpen: true,
                balance: 0,
              }, ['name']))
              .toSorted((a, b) => a.name.localeCompare(b.name, 'hu', {
                sensitivity: 'base',
              })),
          };
        };
      }),
    ),
  );
};
