import { inject } from '@angular/core';
import { AccountService } from '@household/services/account-service';
import { accountApiEvents } from '@household/state/account/account-events';
import { notificationEvents } from '@household/shared-ui';
import { signalStoreFeature } from '@ngrx/signals';
import { Events, withEventHandlers } from '@ngrx/signals/events';
import { catchError, exhaustMap, groupBy, map, mergeMap } from 'rxjs';

export const withAccountApiEvents = () => {
  return signalStoreFeature(
    withEventHandlers(() => {
      const events = inject(Events);
      const accountService = inject(AccountService);

      return {
        listAccounts: events.on(accountApiEvents.listAccountsInitiated).pipe(
          exhaustMap(() => {
            return accountService.listAccounts().pipe(
              map((accounts) => accountApiEvents.listAccountsCompleted(accounts)),
              catchError(() => {
                return [notificationEvents.showMessage('Hiba történt')];
              }),
            );
          }),
        ),
        createAccount: events.on(accountApiEvents.createAccountInitiated).pipe(
          mergeMap(({ payload }) => {
            return accountService.createAccount(payload).pipe(
              map(({ accountId }) => accountApiEvents.createAccountCompleted({
                accountId,
                ...payload,
              })),
              catchError((error) => {
                let errorMessage: string;
                switch(error.error?.message) {
                  case 'Duplicate account name': {
                    errorMessage = `Számla (${payload.name}) már létezik!`;
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
        updateAccount: events.on(accountApiEvents.updateAccountInitiated).pipe(
          groupBy(({ payload }) => payload.accountId),
          mergeMap((value) => {
            return value.pipe(exhaustMap(({ payload: { accountId, ...request } }) => {
              return accountService.updateAccount(accountId, request).pipe(
                map(() => accountApiEvents.updateAccountCompleted({
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
                  return [
                    accountApiEvents.updateAccountFailed({
                      accountId,
                    }),
                    notificationEvents.showMessage(errorMessage),
                  ];
                }),
              );
            }));
          }),
        ),
        deleteAccount: events.on(accountApiEvents.deleteAccountInitiated).pipe(
          mergeMap(({ payload: { accountId } }) => {
            return accountService.deleteAccount(accountId).pipe(
              map(() => accountApiEvents.deleteAccountCompleted({
                accountId,
              })),
              catchError(() => {
                return [
                  accountApiEvents.deleteAccountFailed({
                    accountId,
                  }),
                  notificationEvents.showMessage('Hiba történt'),
                ];
              }),
            );
          }),
        ),
        openAccount: events.on(accountApiEvents.openAccountInitiated).pipe(
          mergeMap(({ payload: { accountId } }) => {
            return accountService.openAccount(accountId).pipe(
              map(() => accountApiEvents.openAccountCompleted({
                accountId,
              })),
              catchError(() => {
                return [
                  accountApiEvents.openAccountFailed({
                    accountId,
                  }),
                  notificationEvents.showMessage('Hiba történt'),
                ];
              }),
            );
          }),
        ),
        closeAccount: events.on(accountApiEvents.closeAccountInitiated).pipe(
          mergeMap(({ payload: { accountId } }) => {
            return accountService.closeAccount(accountId).pipe(
              map(() => accountApiEvents.closeAccountCompleted({
                accountId,
              })),
              catchError(() => {
                return [
                  accountApiEvents.closeAccountFailed({
                    accountId,
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
