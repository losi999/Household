import { inject } from '@angular/core';
import { PriceService } from '@hairdressing/services/price-service';
import { priceApiEvents } from '@hairdressing/state/price/price-events';
import { notificationEvents } from '@household/shared-ui';
import { signalStoreFeature } from '@ngrx/signals';
import { Events, withEventHandlers } from '@ngrx/signals/events';
import { catchError, exhaustMap, groupBy, map, mergeMap } from 'rxjs';

export const withPriceApiEvents = () => {
  return signalStoreFeature(
    withEventHandlers(() => {
      const events = inject(Events);
      const priceService = inject(PriceService);

      return {
        listPrices: events.on(priceApiEvents.listPricesInitiated).pipe(
          exhaustMap(() => {
            return priceService.listPrices().pipe(
              map((prices) => priceApiEvents.listPricesCompleted(prices)),
              catchError(() => {
                return [notificationEvents.showMessage('Hiba történt')];
              }),
            );
          }),
        ),
        createPrice: events.on(priceApiEvents.createPriceInitiated).pipe(
          mergeMap(({ payload }) => {
            return priceService.createPrice(payload).pipe(
              map(({ priceId }) => priceApiEvents.createPriceCompleted({
                priceId,
                ...payload,
              })),
              catchError((error) => {
                let errorMessage: string;
                switch(error.error?.message) {
                  case 'Duplicate price name': {
                    errorMessage = `Árlista elem (${payload.name}) már létezik!`;
                  } break;
                  default: {
                    errorMessage = 'Hiba történt';
                  }
                }
                return [notificationEvents.showMessage(errorMessage)];
              }),
            );
          }),
        ),
        updatePrice: events.on(priceApiEvents.updatePriceInitiated).pipe(
          groupBy(({ payload }) => payload.priceId),
          mergeMap((value) => {
            return value.pipe(exhaustMap(({ payload: { priceId, ...request } }) => {
              return priceService.updatePrice(priceId, request).pipe(
                map(({ priceId }) => priceApiEvents.updatePriceCompleted({
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
                  return [
                    priceApiEvents.updatePriceFailed({
                      priceId,
                    }),
                    notificationEvents.showMessage(errorMessage),
                  ];
                }),
              );
            }));
          }),
        ),
        deletePrice: events.on(priceApiEvents.deletePriceInitiated).pipe(
          mergeMap(({ payload: { priceId } }) => {
            return priceService.deletePrice(priceId).pipe(
              map(() => priceApiEvents.deletePriceCompleted({
                priceId,
              })),
              catchError(() => {
                return [
                  priceApiEvents.deletePriceFailed({
                    priceId,
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
