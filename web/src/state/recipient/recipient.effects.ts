import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, groupBy, map, mergeMap, of } from 'rxjs';
import { recipientApiActions } from '@household/web/state/recipient/recipient.actions';
import { RecipientService } from '@household/web/services/recipient.service';
import { progressActions } from '@household/web/state/progress/progress.actions';
import { notificationActions } from '@household/web/state/notification/notification.actions';

@Injectable()
export class RecipientEffects {
  constructor(private actions: Actions, private recipientService: RecipientService) {}

  loadRecipients = createEffect(() => {
    return this.actions.pipe(
      ofType(recipientApiActions.listRecipientsInitiated),
      exhaustMap(() => {
        return this.recipientService.listRecipients().pipe(
          map((recipients) => recipientApiActions.listRecipientsCompleted({
            recipients,
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

  createRecipient = createEffect(() => {
    return this.actions.pipe(
      ofType(recipientApiActions.createRecipientInitiated),
      mergeMap(({ type, ...request }) => {
        return this.recipientService.createRecipient(request).pipe(
          map(({ recipientId }) => recipientApiActions.createRecipientCompleted({
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

  updateRecipient = createEffect(() => {
    return this.actions.pipe(
      ofType(recipientApiActions.updateRecipientInitiated),
      groupBy(({ recipientId }) => recipientId),
      mergeMap((value) => {
        return value.pipe(exhaustMap(({ type, recipientId, ...request }) => {
          return this.recipientService.updateRecipient(recipientId, request).pipe(
            map(({ recipientId }) => recipientApiActions.updateRecipientCompleted({
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

  deleteRecipient = createEffect(() => {
    return this.actions.pipe(
      ofType(recipientApiActions.deleteRecipientInitiated),
      mergeMap(({ recipientId }) => {
        return this.recipientService.deleteRecipient(recipientId).pipe(
          map(() => recipientApiActions.deleteRecipientCompleted({
            recipientId,
          })),
          catchError(() => {
            return of(recipientApiActions.deleteRecipientFailed({
              recipientId,
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

  mergeRecipients = createEffect(() => {
    return this.actions.pipe(
      ofType(recipientApiActions.mergeRecipientsInitiated),
      exhaustMap(({ sourceRecipientIds, targetRecipientId }) => {
        return this.recipientService.mergeRecipients(targetRecipientId, sourceRecipientIds).pipe(
          map(() => recipientApiActions.mergeRecipientsCompleted({
            sourceRecipientIds,
          })),
          catchError(() => {
            return of(recipientApiActions.mergeRecipientsFailed({
              sourceRecipientIds,
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

