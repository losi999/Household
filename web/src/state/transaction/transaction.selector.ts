import { Transaction } from '@household/shared/types/types';
import { TransactionState } from '@household/web/state/transaction/transaction.reducer';
import { createFeatureSelector, createSelector } from '@ngrx/store';

const selectTransactions = createFeatureSelector<TransactionState>('transactions');

export const selectTransactionList = createSelector(selectTransactions, ({ transactionList }) => {
  return transactionList;
});

export const selectTransaction = createSelector(selectTransactions, ({ selectedTransaction }) => {
  return selectedTransaction;
});

export const selectDeferredTransactionList = (excludedTransactionIds?: Transaction.Id[]) => createSelector(selectTransactions, ({ deferredTransactionList }) => {
  return excludedTransactionIds ? deferredTransactionList.filter(t => !excludedTransactionIds.includes(t.transactionId)) : deferredTransactionList;
});

export const selectDraftTransactionList = createSelector(selectTransactions, ({ draftTransactionList }) => {
  return draftTransactionList;
});

export const selectReport = createSelector(selectTransactions, ({ report }) => {
  return report ?? [];
});
