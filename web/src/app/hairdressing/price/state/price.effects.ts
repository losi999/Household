import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { exhaustMap, filter, map } from 'rxjs';
import { priceActions, priceApiActions } from '@household/web/app/hairdressing/price/state/price.actions';
import { DialogService } from '@household/web/services/dialog.service';
import { MatDialog } from '@angular/material/dialog';
import { PriceDialogComponent, PriceDialogData, PriceDialogResult } from '@household/web/app/hairdressing/price/price-dialog/price-dialog.component';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { CatalogSubmenuComponent, CatalogSubmenuData, CatalogSubmenuResult } from '@household/web/app/shared/catalog-submenu/catalog-submenu.component';

@Injectable()
export class PriceEffects {
  constructor(private actions: Actions, private dialog: MatDialog, private dialogService: DialogService, private bottomSheet: MatBottomSheet) {}

  openCreatePriceDialog = createEffect(() => {
    return this.actions.pipe(
      ofType(priceActions.createPrice),
      exhaustMap(() => {
        return this.dialog.open<PriceDialogComponent, PriceDialogData, PriceDialogResult>(PriceDialogComponent, {
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
        return this.dialog.open<PriceDialogComponent, PriceDialogData, PriceDialogResult>(PriceDialogComponent, {
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
        return this.bottomSheet.open<CatalogSubmenuComponent, CatalogSubmenuData, CatalogSubmenuResult>(CatalogSubmenuComponent, {
          data: {
            title: price.name,
            hideMerge: true,
          },
        }).afterDismissed()
          .pipe(
            filter(value => !!value),
            map((value) => {
              switch(value) {
                case CatalogSubmenuResult.Edit: return priceActions.updatePrice(price);
                case CatalogSubmenuResult.Delete: return priceActions.deletePrice(price);
              }
            }),
          );
      }),
    );
  });
}

