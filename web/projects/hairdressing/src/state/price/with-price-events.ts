import { inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PriceDialog, PriceDialogData, PriceDialogResult } from '@hairdressing/app/price/price-dialog/price-dialog';
import { priceApiEvents, priceEvents } from '@hairdressing/state/price/price-events';
import { DialogService, BottomSheetService, dispatchIfConfirmed } from '@household/shared-ui';
import { signalStoreFeature } from '@ngrx/signals';
import { Events, withEventHandlers } from '@ngrx/signals/events';
import { exhaustMap, filter, map } from 'rxjs';

export const withPriceEvents = () => {
  return signalStoreFeature(
    withEventHandlers(() => {

      const events = inject(Events);
      const dialog = inject(MatDialog);
      const dialogService = inject(DialogService);
      const bottomSheetService = inject(BottomSheetService);

      return {
        openCreatePriceDialog: events.on(priceEvents.createPrice)
          .pipe(
            exhaustMap(() => {
              return dialog.open<PriceDialog, PriceDialogData, PriceDialogResult>(PriceDialog, {
                disableClose: true,
              }).afterClosed();
            }),
            filter(req => !!req),
            map((request) => {
              return priceApiEvents.createPriceInitiated(request);
            }),
          ),
        openUpdatePriceDialog: events.on(priceEvents.updatePrice).pipe(
          exhaustMap(({ payload }) => {
            return dialog.open<PriceDialog, PriceDialogData, PriceDialogResult>(PriceDialog, {
              data: payload,
              disableClose: true,
            }).afterClosed()
              .pipe(filter(req => !!req),
                map((request) => {
                  return priceApiEvents.updatePriceInitiated({
                    priceId: payload.priceId,
                    ...request,
                  });
                }));
          }),    
        ),
        openDeletePriceDialog: events.on(priceEvents.deletePrice).pipe(
          exhaustMap(({ payload }) => {
            return dialogService.openConfirmationDialog({
              title: 'Törölni akarod ezt a tételt az árlistából?',
              content: payload.name,
            }).pipe(
              dispatchIfConfirmed(priceApiEvents.deletePriceInitiated({
                priceId: payload.priceId,
              })),
            );
          }),
        ),
        openPriceListItemSubmenu: events.on(priceEvents.openPriceListItemSubmenu)
          .pipe(
            exhaustMap(({ payload }) => {
              return bottomSheetService.openBottomSubmenu(payload.name, 'edit', 'delete')
                .afterDismissed()
                .pipe(
                  filter(value => !!value),
                  map((value) => {
                    switch(value) {
                      case 'edit': return priceEvents.updatePrice(payload);
                      case 'delete': return priceEvents.deletePrice(payload);
                    }
                  }),
                );
            }),
          ),
      };
    },
    ),
  );
};
