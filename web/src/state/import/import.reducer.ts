import { TransactionType } from '@household/shared/enums';
import { Transaction } from '@household/shared/types/types';
import { importActions } from '@household/web/state/import/import.actions';
import { transactionApiActions } from '@household/web/state/transaction/transaction.actions';
import { ImportedTransaction } from '@household/web/types/common';
import { createReducer, on } from '@ngrx/store';

export type ImportState = {
  initialDrafts: Transaction.DraftResponse[];
  modifiedTransactions: {
    [transactionId: Transaction.Id]: ImportedTransaction;
  }
};

export const importReducer = createReducer<ImportState>({
  initialDrafts: [],
  modifiedTransactions: {},
},

on(transactionApiActions.listDraftTransactionsInitiated, (_state) => {
  return {
    ..._state,
    initialDrafts: [],
  };
}),
on(transactionApiActions.listDraftTransactionsCompleted, (_state, { transactions }) => {
  return {
    ..._state,
    initialDrafts: transactions,
  };
}),
on(importActions.importPaymentTransactionCompleted, importActions.importTransferTransactionCompleted, (_state, { transactionId }) => {
  return {
    ..._state,
    initialDrafts: _state.initialDrafts.filter(t => t.transactionId !== transactionId),
  };
}),

on(importActions.applyEditingFields, (_state, { transactionIds, updatedValues }) => {
  return {
    ..._state,
    modifiedTransactions: {
      ..._state.modifiedTransactions,
      ...transactionIds.reduce((accumulator, currentValue) => {
        const original = _state.modifiedTransactions[currentValue] ?? _state.initialDrafts.find(t => t.transactionId === currentValue) as ImportedTransaction;
        const tx: ImportedTransaction = {
          ...original,
          ...updatedValues,
        };

        tx.payingAccount = tx.account;
        tx.ownerAccount = tx.loanAccount;

        if (updatedValues.transferAccount) {
          tx.transactionType = TransactionType.Transfer;
        } else {
          tx.transactionType = TransactionType.Payment;
        }

        if (!tx.account) {
          tx.transactionType = TransactionType.Draft;
        }

        return {
          ...accumulator,
          [currentValue]: tx,
        };
      }, {}),
    },
  };
}),

on(transactionApiActions.deleteTransactionCompleted, (_state, { transactionId }) => {
  return {
    ..._state,
    initialDrafts: _state.initialDrafts.filter(draft => draft.transactionId !== transactionId),
  };
}),

on(importActions.deduplicateDraftTransaction, (_state, { transactionId }) => {
  const draft = _state.initialDrafts.find(d => d.transactionId === transactionId);
  return {
    ..._state,
    modifiedTransactions: {
      ..._state.modifiedTransactions,
      [transactionId]: {
        ...draft,
        potentialDuplicates: [],
      },
    },
  };
}),
);

// export const hydrationMetaReducer = (reducer: ActionReducer<any>): ActionReducer<any> => {
//   return (state, action) => {
//     // if (!state) {
//     //   const storedState = localStorage.getItem('drafts');
//     //   return storedState ? {
//     //     import: {
//     //       modifiedTransactions: JSON.parse(storedState),
//     //     },
//     //   } : reducer(state, action);
//     // }
//     return reducer(state, action);
//   };
// };
