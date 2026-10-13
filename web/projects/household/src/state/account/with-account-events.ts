import { inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AccountDialog, AccountDialogData, AccountDialogResult } from '@household/app/account/account-dialog/account-dialog';
import { accountApiEvents, accountEvents } from '@household/state/account/account-events';
import { BottomSheetService, DialogService, dispatchIfConfirmed } from '@household/shared-ui';
import { signalStoreFeature } from '@ngrx/signals';
import { Events, withEventHandlers } from '@ngrx/signals/events';
import { exhaustMap, filter, map, Observable } from 'rxjs';

export const withAccountEvents = () => {
  return signalStoreFeature(
    withEventHandlers(() => {
      const events = inject(Events);
      const dialog = inject(MatDialog);
      const bottomSheetService = inject(BottomSheetService);
      const dialogService = inject(DialogService);

      return {
        openCreateAccountDialog: events.on(accountEvents.createAccount)
          .pipe(
            exhaustMap(() => {
              return dialog.open<AccountDialog, AccountDialogData, AccountDialogResult>(AccountDialog, {
                disableClose: true,
              }).afterClosed();
            }),
            filter(req => !!req),
            map((request) => {
              return accountApiEvents.createAccountInitiated(request);
            }),
          ),
        openUpdateAccountDialog: events.on(accountEvents.updateAccount).pipe(
          exhaustMap(({ payload }) => {
            return dialog.open<AccountDialog, AccountDialogData, AccountDialogResult>(AccountDialog, {
              data: payload,
              disableClose: true,
            }).afterClosed()
              .pipe(
                filter(req => !!req),
                map((request) => {
                  return accountApiEvents.updateAccountInitiated({
                    accountId: payload.accountId,
                    ...request,
                  });
                }),
              );
          }),
        ),
        // The transactions of the account are deleted together with the account
        openDeleteAccountDialog: events.on(accountEvents.deleteAccount).pipe(
          exhaustMap(({ payload }) => {
            return dialogService.openConfirmationDialog({
              title: 'Törölni akarod ezt a számlát?',
              content: `${payload.name}. A számla összes tranzakciója is törlődik!`,
            }).pipe(
              dispatchIfConfirmed(accountApiEvents.deleteAccountInitiated({
                accountId: payload.accountId,
              })),
            );
          }),
        ),
        openCloseAccountDialog: events.on(accountEvents.closeAccount).pipe(
          exhaustMap(({ payload }) => {
            return dialogService.openConfirmationDialog({
              title: 'Le akarod zárni ezt a számlát?',
              content: payload.name,
            }).pipe(
              dispatchIfConfirmed(accountApiEvents.closeAccountInitiated({
                accountId: payload.accountId,
              })),
            );
          }),
        ),
        openOpenAccountDialog: events.on(accountEvents.openAccount).pipe(
          exhaustMap(({ payload }) => {
            return dialogService.openConfirmationDialog({
              title: 'Újra akarod nyitni ezt a számlát?',
              content: payload.name,
            }).pipe(
              dispatchIfConfirmed(accountApiEvents.openAccountInitiated({
                accountId: payload.accountId,
              })),
            );
          }),
        ),
        openAccountListItemSubmenu: events.on(accountEvents.openAccountListItemSubmenu)
          .pipe(
            exhaustMap(({ payload }) => {
              let afterDismissed: Observable<'edit' | 'open' | 'close' | 'delete'>;

              // An open account can be closed, a closed account can be opened again
              if (payload.isOpen) {
                afterDismissed = bottomSheetService.openBottomSubmenu(payload.name, 'edit', 'close', 'delete').afterDismissed();
              } else {
                afterDismissed = bottomSheetService.openBottomSubmenu(payload.name, 'edit', 'open', 'delete').afterDismissed();
              }

              return afterDismissed.pipe(
                filter(value => !!value),
                map((value) => {
                  switch(value) {
                    case 'edit': return accountEvents.updateAccount(payload);
                    case 'open': return accountEvents.openAccount(payload);
                    case 'close': return accountEvents.closeAccount(payload);
                    case 'delete': return accountEvents.deleteAccount(payload);
                  }
                }),
              );
            }),
          ),
      };
    }),
  );
};
