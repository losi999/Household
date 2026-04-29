import { Transaction } from '@household/shared/types/types';
import { ImportState } from '@household/web/state/import/import.reducer';
import { createFeatureSelector, createSelector } from '@ngrx/store';

const selectImport = createFeatureSelector<ImportState>('import');

export const selectDraftTransactionList = (transactionIds?: Transaction.Id[]) => createSelector(selectImport, ({ initialDrafts, modifiedTransactions }) => {
  const drafts = transactionIds?.length > 0 ? initialDrafts.filter(t => transactionIds.includes(t.transactionId)) : initialDrafts;

  return drafts.map(t => modifiedTransactions[t.transactionId] ?? t).filter(d => d.potentialDuplicates.length === 0);
});

export const selectDuplicateDraftTransactionList = createSelector(selectImport, ({ initialDrafts, modifiedTransactions }) => {
  return initialDrafts.map(t => modifiedTransactions[t.transactionId] ?? t).filter(d => d.potentialDuplicates.length > 0);
});
