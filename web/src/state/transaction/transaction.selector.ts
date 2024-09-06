import { Account, Transaction } from '@household/shared/types/types';
import { createFeatureSelector, createSelector } from '@ngrx/store';

export const selectTransactions = createFeatureSelector<Transaction.Response[]>('transactions');
