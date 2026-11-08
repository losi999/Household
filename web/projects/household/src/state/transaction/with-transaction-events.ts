import { inject } from '@angular/core';
import { DialogService, dispatchIfConfirmed } from '@household/shared-ui';
import { transactionApiEvents, transactionEvents } from '@household/state/transaction/transaction-events';
import { signalStoreFeature } from '@ngrx/signals';
import { Events, withEventHandlers } from '@ngrx/signals/events';
import { exhaustMap } from 'rxjs';

export const withTransactionEvents = () => {
  return signalStoreFeature(
    withEventHandlers(() => {
      const events = inject(Events);
      const dialogService = inject(DialogService);

      return {
        openDeleteTransactionDialog: events.on(transactionEvents.deleteTransaction).pipe(
          exhaustMap(({ payload }) => {
            return dialogService.openConfirmationDialog({
              title: 'Törölni akarod ezt a tranzakciót?',
            }).pipe(
              dispatchIfConfirmed(transactionApiEvents.deleteTransactionInitiated({
                transactionId: payload.transactionId,
              })),
            );
          }),
        ),
      };
    }),
  );
};
