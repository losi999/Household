import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, groupBy, map, mergeMap, of } from 'rxjs';
import { accountApiActions } from '@household/web/state/account/account.actions';
import { AccountService } from '@household/web/services/account.service';
import { progressActions } from '@household/web/state/progress/progress.actions';
import { notificationActions } from '@household/web/state/notification/notification.actions';

@Injectable()
export class AccountEffects {
  constructor(private actions: Actions, private accountService: AccountService) {}

  loadAccounts = createEffect(() => {
    return this.actions.pipe(
      ofType(accountApiActions.listAccountsInitiated),
      exhaustMap(() => {
        return this.accountService.listAccounts().pipe(
          map((accounts) => accountApiActions.listAccountsCompleted({
            accounts,
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

  createAccount = createEffect(() => {
    return this.actions.pipe(
      ofType(accountApiActions.createAccountInitiated),
      mergeMap(({ type, ...request }) => {
        return this.accountService.createAccount(request).pipe(
          map(({ accountId }) => accountApiActions.createAccountCompleted({
            accountId,
            ...request,
          })),
          catchError((error) => {
            let errorMessage: string;
            switch(error.error?.message) {
              case 'Duplicate account name': {
                errorMessage = `Számla (${request.name}) már létezik!`;
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

  updateAccount = createEffect(() => {
    return this.actions.pipe(
      ofType(accountApiActions.updateAccountInitiated),
      groupBy(({ accountId }) => accountId),
      mergeMap((value) => {
        return value.pipe(exhaustMap(({ type, accountId, ...request }) => {
          return this.accountService.updateAccount(accountId, request).pipe(
            map(({ accountId }) => accountApiActions.updateAccountCompleted({
              accountId,
              ...request,
            })),
            catchError((error) => {
              let errorMessage: string;
              switch(error.error?.message) {
                case 'Duplicate account name': {
                  errorMessage = `Számla (${request.name}) már létezik!`;
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

  deleteAccount = createEffect(() => {
    return this.actions.pipe(
      ofType(accountApiActions.deleteAccountInitiated),
      mergeMap(({ accountId }) => {
        return this.accountService.deleteAccount(accountId).pipe(
          map(() => accountApiActions.deleteAccountCompleted({
            accountId,
          })),
          catchError(() => {
            return of(accountApiActions.deleteAccountFailed({
              accountId,
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

