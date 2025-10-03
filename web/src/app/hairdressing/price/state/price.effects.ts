import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, filter, groupBy, map, mergeMap, of } from 'rxjs';
import { progressActions } from '@household/web/state/progress/progress.actions';
import { notificationActions } from '@household/web/state/notification/notification.actions';
import { priceActions, priceApiActions } from '@household/web/app/hairdressing/price/state/price.actions';
import { PriceService } from '@household/web/services/price.service';
import { DialogService } from '@household/web/services/dialog.service';
import { MatDialog } from '@angular/material/dialog';
import { PriceDialogComponent, PriceDialogData, PriceDialogResult } from '@household/web/app/hairdressing/price/price-dialog/price-dialog.component';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { CatalogSubmenuComponent, CatalogSubmenuData, CatalogSubmenuResult } from '@household/web/app/shared/catalog-submenu/catalog-submenu.component';

@Injectable()
export class PriceEffects {
  constructor(private actions: Actions, private priceService: PriceService, private dialog: MatDialog, private dialogService: DialogService, private bottomSheet: MatBottomSheet) {}

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
          title: 'Törölni akarod ezt a tételt az árlistából? Az összes munka amihez hozzá van rendelve szintén törlődni fog!',
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
                case 'edit': return priceActions.updatePrice(price);
                case 'delete': return priceActions.deletePrice(price);
              }
            }),
          );
      }),
    );
  });

  listPrices = createEffect(() => {
    return this.actions.pipe(
      ofType(priceApiActions.listPricesInitiated),
      exhaustMap(() => {
        return this.priceService.listPrices().pipe(
          map((prices) => priceApiActions.listPricesCompleted({
            prices,
          })),
          catchError(() => {
            return of(progressActions.processFinished(),
              notificationActions.showMessage({
                message: 'Hiba történt',
              }),
            );
          }),
        );
      }),
    );
  });
  
  createPrice = createEffect(() => {
    return this.actions.pipe(
      ofType(priceApiActions.createPriceInitiated),
      mergeMap(({ type, ...request }) => {
        return this.priceService.createPrice(request).pipe(
          map(({ priceId }) => priceApiActions.createPriceCompleted({
            priceId,
            ...request,
          })),
          catchError((error) => {
            let errorMessage: string;
            switch(error.error?.message) {
              case 'Duplicate price name': {
                errorMessage = `Árlista elem (${request.name}) már létezik!`;
              } break;
              default: {
                errorMessage = 'Hiba történt';
              }
            }
            return of(progressActions.processFinished(),
              notificationActions.showMessage({
                message: errorMessage,
              }),
            );
          }),
        );
      }),
    );
  });

  updatePrice = createEffect(() => {
    return this.actions.pipe(
      ofType(priceApiActions.updatePriceInitiated),
      groupBy(({ priceId }) => priceId),
      mergeMap((value) => {
        return value.pipe(exhaustMap(({ type, priceId, ...request }) => {
          return this.priceService.updatePrice(priceId, request).pipe(
            map(({ priceId }) => priceApiActions.updatePriceCompleted({
              priceId,
              ...request,
            })),
            catchError((error) => {
              let errorMessage: string;
              switch(error.error?.message) {
                case 'Duplicate price name': {
                  errorMessage = `Árlista elem (${request.name}) már létezik!`;
                } break;
                default: {
                  errorMessage = 'Hiba történt';
                }
              }
              return of(progressActions.processFinished(),
                notificationActions.showMessage({
                  message: errorMessage,
                }),
              );
            }),
          );
        }));
  
      }),
    );
  });
  
  deletePrice = createEffect(() => {
    return this.actions.pipe(
      ofType(priceApiActions.deletePriceInitiated),
      mergeMap(({ priceId }) => {
        return this.priceService.deletePrice(priceId).pipe(
          map(() => priceApiActions.deletePriceCompleted({
            priceId,
          })),
          catchError(() => {
            return of(priceApiActions.deletePriceFailed({
              priceId,
            }), progressActions.processFinished(),
            notificationActions.showMessage({
              message: 'Hiba történt',
            }),
            );
          }),
        );
      }),
    );
  });
}

