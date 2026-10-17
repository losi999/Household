import { inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AccountDialog, AccountDialogData, AccountDialogResult } from '@household/app/account/account-dialog/account-dialog';
import { accountApiEvents, accountEvents } from '@household/state/account/account-events';
import { BottomSheetService, BottomSubmenuItem, DialogService, dispatchIfConfirmed } from '@household/shared-ui';
import { signalStoreFeature } from '@ngrx/signals';
import { Events, withEventHandlers } from '@ngrx/signals/events';
import { EMPTY, exhaustMap, filter, map } from 'rxjs';
import { AccountType } from '@household/shared/enums';

// Only accounts have these menu items, so they are not part of the common items of the BottomSheetService
export const openAccountMenuItem = {
  action: 'open',
  icon: 'credit_card',
  label: 'Nyitás',
} as const;

export const closeAccountMenuItem = {
  action: 'close',
  icon: 'credit_card_off',
  label: 'Zárás',
} as const;

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
              const subMenuItems: BottomSubmenuItem[] = [
                {
                  link: `accounts/${payload.accountId}`,
                  icon: 'format_list_bulleted',
                  label: 'Tranzakciók',
                },
                {
                  link: '/',
                  icon: 'post_add',
                  label: 'Új tranzakció',
                },
              ]; 

              if (payload.accountType === AccountType.Cash) {
                subMenuItems.push({
                  link: `accounts/${payload.accountId}/balance`,
                  icon: 'payments',
                  label: 'Új egyenleg',
                });
              }

              subMenuItems.push(payload.isOpen ? {
                action: 'close',
                icon: 'credit_card_off',
                label: 'Zárás',
              } : {
                action: 'open',
                icon: 'credit_card',
                label: 'Nyitás',
              });

              return bottomSheetService.openBottomSubmenu(payload.name, [
                ...subMenuItems,
                BottomSheetService.Edit,
                BottomSheetService.Delete,
              ]).afterDismissed()
                .pipe(
                  filter(value => !!value),
                  map((value) => {
                    switch(value) {
                      case 'edit': return accountEvents.updateAccount(payload);
                      case 'open': return accountEvents.openAccount(payload);
                      case 'close': return accountEvents.closeAccount(payload);
                      case 'delete': return accountEvents.deleteAccount(payload);
                      default: return EMPTY;
                    }
                  }),
                );
            }),
          ),
      };
    }),
  );
};
