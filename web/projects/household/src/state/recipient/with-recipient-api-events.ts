import { inject } from '@angular/core';
import { RecipientService } from '@household/services/recipient-service';
import { recipientApiEvents } from '@household/state/recipient/recipient-events';
import { notificationEvents } from '@household/shared-ui';
import { signalStoreFeature } from '@ngrx/signals';
import { Events, withEventHandlers } from '@ngrx/signals/events';
import { catchError, exhaustMap, groupBy, map, mergeMap } from 'rxjs';

export const withRecipientApiEvents = () => {
  return signalStoreFeature(
    withEventHandlers(() => {
      const events = inject(Events);
      const recipientService = inject(RecipientService);

      return {
        listRecipients: events.on(recipientApiEvents.listRecipientsInitiated).pipe(
          exhaustMap(() => {
            return recipientService.listRecipients().pipe(
              map((recipients) => recipientApiEvents.listRecipientsCompleted(recipients)),
              catchError(() => {
                return [notificationEvents.showMessage('Hiba történt')];
              }),
            );
          }),
        ),
        createRecipient: events.on(recipientApiEvents.createRecipientInitiated).pipe(
          mergeMap(({ payload }) => {
            return recipientService.createRecipient(payload).pipe(
              map(({ recipientId }) => recipientApiEvents.createRecipientCompleted({
                recipientId,
                ...payload,
              })),
              catchError((error) => {
                let errorMessage: string;
                switch(error.error?.message) {
                  case 'Duplicate recipient name': {
                    errorMessage = `Partner (${payload.name}) már létezik!`;
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
        updateRecipient: events.on(recipientApiEvents.updateRecipientInitiated).pipe(
          groupBy(({ payload }) => payload.recipientId),
          mergeMap((value) => {
            return value.pipe(exhaustMap(({ payload: { recipientId, ...request } }) => {
              return recipientService.updateRecipient(recipientId, request).pipe(
                map(() => recipientApiEvents.updateRecipientCompleted({
                  recipientId,
                  ...request,
                })),
                catchError((error) => {
                  let errorMessage: string;
                  switch(error.error?.message) {
                    case 'Duplicate recipient name': {
                      errorMessage = `Partner (${request.name}) már létezik!`;
                    } break;
                    default: {
                      errorMessage = 'Hiba történt';
                    }
                  }
                  return [
                    recipientApiEvents.updateRecipientFailed({
                      recipientId,
                    }),
                    notificationEvents.showMessage(errorMessage),
                  ];
                }),
              );
            }));
          }),
        ),
        deleteRecipient: events.on(recipientApiEvents.deleteRecipientInitiated).pipe(
          mergeMap(({ payload: { recipientId } }) => {
            return recipientService.deleteRecipient(recipientId).pipe(
              map(() => recipientApiEvents.deleteRecipientCompleted({
                recipientId,
              })),
              catchError(() => {
                return [
                  recipientApiEvents.deleteRecipientFailed({
                    recipientId,
                  }), 
                  notificationEvents.showMessage('Hiba történt'),
                ];
              }),
            );
          }),    
        ),
        mergeRecipients: events.on(recipientApiEvents.mergeRecipientsInitiated).pipe(
          mergeMap(({ payload: { targetRecipientId, sourceRecipientIds } }) => {
            return recipientService.mergeRecipients(targetRecipientId, sourceRecipientIds).pipe(
              map(() => recipientApiEvents.mergeRecipientsCompleted({
                sourceRecipientIds,
              })),
              catchError(() => {
                return [
                  recipientApiEvents.mergeRecipientsFailed({
                    sourceRecipientIds,
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
