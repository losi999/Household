import { Account, Transaction } from '@household/shared/types/types';
import { createReducer, on } from '@ngrx/store';
import { transactionApiActions } from '@household/web/state/transaction/transaction.actions';

export const transactionReducer = createReducer<Transaction.Response[]>([],
  on(transactionApiActions.listTransactionsInitiated, (_state, { pageNumber }) => {
    return pageNumber === 1 ? [] : _state;
  }),
  on(transactionApiActions.listTransactionsCompleted, (_state, { transactions, pageNumber }) => {
    return pageNumber === 1 ? transactions : _state.concat(...transactions);
  }),
  // on(projectApiActions.createProjectCompleted, projectApiActions.updateProjectCompleted, (_state, { projectId, name, description }) => {

  //   return _state.filter(p => p.projectId !== projectId)
  //     .concat({
  //       projectId,
  //       name,
  //       description,
  //     })
  //     .toSorted((a, b) => a.name.localeCompare(b.name, 'hu', {
  //       sensitivity: 'base',
  //     }));
  // }),
  // on(projectApiActions.deleteProjectCompleted, (_state, { projectId }) => {
  //   return _state.filter(p => p.projectId !== projectId);
  // }),
  // on(projectApiActions.mergeProjectsCompleted, (_state, { sourceProjectIds }) => {
  //   return _state.filter(p => !sourceProjectIds.includes(p.projectId));
  // }),
);
