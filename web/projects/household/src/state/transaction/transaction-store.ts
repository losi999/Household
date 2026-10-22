import { Api } from '@household/shared/types/api';
import { Responses } from '@household/shared/types/responses';
import { signalStore, withState } from '@ngrx/signals';
import { withTransactionApiEvents } from '@household/state/transaction/with-transaction-api-events';
import { withTransactionEvents } from '@household/state/transaction/with-transaction-events';
import { withTransactionReducer } from '@household/state/transaction/with-transaction-reducer';
import { inject, ValueProvider, InjectionToken } from '@angular/core';

const TRANSACTION_STORE_INITIAL_STATE = new InjectionToken<TransactionState>('TRANSACTION_STORE_INITIAL_STATE');

export type TransactionState = {
  transactionList: Responses.Transaction[];
  isInProgress: Api.Transaction.Id[];
};

export const provideTransactionStoreInitialState = (state: TransactionState = {
  transactionList: [],
  isInProgress: [],
}): ValueProvider => {
  return {
    provide: TRANSACTION_STORE_INITIAL_STATE,
    useValue: state,
  };
};

export const TransactionStore = signalStore({
  providedIn: 'root',
},
withState<TransactionState>(() => {
  const initialState = inject(TRANSACTION_STORE_INITIAL_STATE);

  return initialState;
}),
withTransactionReducer(),
withTransactionApiEvents(),
withTransactionEvents(),
);
