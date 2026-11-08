import { inject } from '@angular/core';
import { TransactionService } from '@household/services/transaction-service';
import { transactionApiEvents } from '@household/state/transaction/transaction-events';
import { notificationEvents } from '@household/shared-ui';
import { signalStoreFeature } from '@ngrx/signals';
import { Events, withEventHandlers } from '@ngrx/signals/events';
import { catchError, concatMap, map, mergeMap } from 'rxjs';

export const withTransactionApiEvents = () => {
  return signalStoreFeature(
    withEventHandlers(() => {
      const events = inject(Events);
      const transactionService = inject(TransactionService);

      return {
        // The requests are handled one after the other, so no page is lost and the pages are appended in order
        listTransactionsByAccount: events.on(transactionApiEvents.listTransactionsByAccountInitiated).pipe(
          concatMap(({ payload: { accountId, pageNumber, pageSize } }) => {
            return transactionService.listTransactionsByAccount(accountId, {
              pageNumber,
              pageSize,
            }).pipe(
              map((transactions) => transactionApiEvents.listTransactionsByAccountCompleted({
                pageNumber,
                transactions,
              })),
              catchError(() => {
                return [notificationEvents.showMessage('Hiba történt')];
              }),
            );
          }),
        ),
        deleteTransaction: events.on(transactionApiEvents.deleteTransactionInitiated).pipe(
          mergeMap(({ payload: { transactionId } }) => {
            return transactionService.deleteTransaction(transactionId).pipe(
              map(() => transactionApiEvents.deleteTransactionCompleted({
                transactionId,
              })),
              catchError(() => {
                return [
                  transactionApiEvents.deleteTransactionFailed({
                    transactionId,
                  }),
                  notificationEvents.showMessage('Hiba történt'),
                ];
              }),
            );
          }),
        ),
      };
    }),
  );
};
