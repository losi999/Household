import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, groupBy, map, mergeMap, of } from 'rxjs';
import { accountApiActions } from 'src/app/state/account/account.actions';
import { AccountService } from 'src/app/account/account.service';
import { progressActions } from 'src/app/state/progress/progress.actions';
import { notificationActions } from 'src/app/state/notification/notification.action';

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
              notificationActions.showError({
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
                // errorMessage = `Projekt név (${request.name}) már foglalt!`;
              } break;
              default: {
                errorMessage = 'Hiba történt';
              }
            }
            return of(progressActions.processFinished(),
              notificationActions.showError({
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
                  // errorMessage = `Projekt név (${request.name}) már foglalt!`;
                } break;
                default: {
                  errorMessage = 'Hiba történt';
                }
              }
              return of(progressActions.processFinished(),
                notificationActions.showError({
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
            notificationActions.showError({
              message: 'Hiba történt',
            }),
            );
          }),
        );
      }),
    );
  });
}

