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

    return Object.keys(grouped).toSorted((a, b) => a.localeCompare(b, 'hu', {
      sensitivity: 'base',
    }))
      .map(o => ({
        owner: o,
        accounts: grouped[o],
      }));
  },
);
