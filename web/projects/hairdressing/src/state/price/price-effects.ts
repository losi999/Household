import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { exhaustMap, filter, map } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { priceActions, priceApiActions } from '@hairdressing/state/price/price-actions';
import { BottomSheetService, DialogService } from '@household/shared-ui';
import { PriceDialog, PriceDialogData, PriceDialogResult } from '@hairdressing/app/price/price-dialog/price-dialog';

@Injectable()
export class PriceEffects {
  private actions = inject(Actions);
  private dialog = inject(MatDialog);
  private dialogService = inject(DialogService);
  private bottomSheetService = inject(BottomSheetService);

  openCreatePriceDialog = createEffect(() => {
    return this.actions.pipe(
      ofType(priceActions.createPrice),
      exhaustMap(() => {
        return this.dialog.open<PriceDialog, PriceDialogData, PriceDialogResult>(PriceDialog, {
          disableClose: true,
        }).afterClosed();
      }),
      filter(req => !!req),
      map((request) => {
        return priceApiActions.createPriceInitiated(request);
      }),
    );
  });
  
  openUpdatePriceDialog = createEffect(() => {
    return this.actions.pipe(
      ofType(priceActions.updatePrice),
      exhaustMap(({ type, ...price }) => {
        return this.dialog.open<PriceDialog, PriceDialogData, PriceDialogResult>(PriceDialog, {
          data: price,
          disableClose: true,
        }).afterClosed()
          .pipe(filter(req => !!req),
            map((request) => {
              return priceApiActions.updatePriceInitiated({
                priceId: price.priceId,
                ...request,
              });
            }));
      }),      
    );
  });
  
  openDeletePriceDialog = createEffect(() => {
    return this.actions.pipe(
      ofType(priceActions.deletePrice),
      exhaustMap(({ type, ...price }) => {
        return this.dialogService.openConfirmationDialog({
          title: 'Törölni akarod ezt a tételt az árlistából?',
          content: price.name,
        }).pipe(
          filter(confirmed => confirmed),
          map(() => priceApiActions.deletePriceInitiated({
            priceId: price.priceId,
          })));
      }),
    );
  });

  openPriceListItemSubmenu = createEffect(() => {
    return this.actions.pipe(
      ofType(priceActions.openPriceListItemSubmenu),
      exhaustMap(({ type, ...price }) => {
        return this.bottomSheetService.openBottomSubmenu(price.name, 'edit', 'delete')
          .afterDismissed()
          .pipe(
            filter(value => !!value),
            map((value) => {
              switch(value) {
                case 'edit': return priceActions.updatePrice(price);
                case 'delete': return priceActions.deletePrice(price);
              }
            }),
          );
      }),
    );
  });
}

