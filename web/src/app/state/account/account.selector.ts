import { Account } from '@household/shared/types/types';
import { createFeatureSelector, createSelector } from '@ngrx/store';

export const selectAccounts = createFeatureSelector<Account.Response[]>('accounts');

export const selectAccountsByOwner = createSelector(
  selectAccounts, (accounts) => {
    const grouped = accounts.reduce<{[owner: string]: Account.Response[]}>((accumulator, currentValue) => {
      return {
        ...accumulator,
        [currentValue.owner]: [
          ...(accumulator[currentValue.owner] ?? []),
          currentValue,
        ],
      };
    }, {});

    return grouped;
  },
);
