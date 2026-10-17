import { transactionApiEvents } from '@household/state/transaction/transaction-events';
import { TransactionState } from '@household/state/transaction/transaction-store';
import { signalStoreFeature } from '@ngrx/signals';
import { on, withReducer } from '@ngrx/signals/events';

export const withTransactionReducer = () => {
  return signalStoreFeature(
    withReducer<TransactionState>(
      on(transactionApiEvents.listTransactionsByAccountInitiated, ({ payload: { pageNumber } }) => {
        // The transactions of the previously shown account must not be visible while the first page is loading
        if (pageNumber === 1) {
          return {
            transactionList: [],
          };
        }

        return {};
      }),
      on(transactionApiEvents.listTransactionsByAccountCompleted, ({ payload: { pageNumber, transactions } }) => {
        return (state) => {
          if (pageNumber === 1) {
            return {
              transactionList: transactions,
            };
          }

          return {
            transactionList: [
              ...state.transactionList,
              ...transactions,
            ],
          };
        };
      }),
    ),
  );
};
