import { Transaction } from '@household/shared/types/types';
import { createReducer, on } from '@ngrx/store';
import { transactionApiActions } from '@household/web/state/transaction/transaction.actions';

export type TransactionState = {
  transactionList: Transaction.Response[];
  deferredTransactionList?: Transaction.DeferredResponse[];
  selectedTransaction?: Transaction.Response;
  report?: Transaction.Report[];
};

export const transactionReducer = createReducer<TransactionState>({
  transactionList: [],
},
on(transactionApiActions.listTransactionsInitiated, (_state, { pageNumber }) => {
  return {
    ..._state,
    transactionList: pageNumber === 1 ? [] : _state.transactionList,
    selectedTransaction: undefined,
  };
}),
on(transactionApiActions.listTransactionsCompleted, (_state, { transactions, pageNumber }) => {
  return {
    ..._state,
    transactionList: pageNumber === 1 ? transactions : _state.transactionList.concat(...transactions),
  };
}),

on(transactionApiActions.listTransactionReportInitiated, (_state) => {
  return {
    ..._state,
    report: undefined,
  };
}),

on(transactionApiActions.listTransactionReportCompleted, (_state, { transactions }) => {
  return {
    ..._state,
    report: transactions,
  };
}),

on(transactionApiActions.listDeferredTransactionsCompleted, (_state, { transactions }) => {
  return {
    ..._state,
    deferredTransactionList: transactions,
  };
}),

on(transactionApiActions.listDraftTransactionsInitiated, (_state) => {
  return {
    ..._state,
    draftTransactionList: undefined,
  };
}),
on(transactionApiActions.listDraftTransactionsCompleted, (_state, { transactions }) => {
  return {
    ..._state,
    draftTransactionList: transactions.map(t => ({
      ...t,
      transactionType: 'payment',
    })),
  };
}),

on(transactionApiActions.deleteTransactionCompleted, (_state, { transactionId }) => {
  return {
    ..._state,
    transactionList: _state.transactionList.filter(t => t.transactionId !== transactionId),
  };
}),

on(transactionApiActions.getTransactionInitiated, (_state) => {
  return {
    ..._state,
    selectedTransaction: undefined,
  };
}),

on(transactionApiActions.getTransactionCompleted, (_state, { type, ...transaction }) => {
  return {
    ..._state,
    selectedTransaction: transaction,
  };
}),
);
