import { inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RecipientDialog, RecipientDialogData, RecipientDialogResult } from '@household/app/recipient/recipient-dialog/recipient-dialog';
import { recipientApiEvents, recipientEvents } from '@household/state/recipient/recipient-events';
import { DialogService, BottomSheetService, dispatchIfConfirmed } from '@household/shared-ui';
import { signalStoreFeature } from '@ngrx/signals';
import { Events, withEventHandlers } from '@ngrx/signals/events';
import { exhaustMap, filter, map } from 'rxjs';
import { RecipientMergeDialog, RecipientMergeDialogData, RecipientMergeDialogResult } from '@household/app/recipient/recipient-merge-dialog/recipient-merge-dialog';

export const withRecipientEvents = () => {
  return signalStoreFeature(
    withEventHandlers(() => {

      const events = inject(Events);
      const dialog = inject(MatDialog);
      const dialogService = inject(DialogService);
      const bottomSheetService = inject(BottomSheetService);

      return {
        openCreateRecipientDialog: events.on(recipientEvents.createRecipient)
          .pipe(
            exhaustMap(() => {
              return dialog.open<RecipientDialog, RecipientDialogData, RecipientDialogResult>(RecipientDialog, {
                disableClose: true,
              }).afterClosed();
            }),
            filter(req => !!req),
            map((request) => {
              return recipientApiEvents.createRecipientInitiated(request);
            }),
          ),
        openUpdateRecipientDialog: events.on(recipientEvents.updateRecipient).pipe(
          exhaustMap(({ payload }) => {
            return dialog.open<RecipientDialog, RecipientDialogData, RecipientDialogResult>(RecipientDialog, {
              data: payload,
              disableClose: true,
            }).afterClosed()
              .pipe(filter(req => !!req),
                map((request) => {
                  return recipientApiEvents.updateRecipientInitiated({
                    recipientId: payload.recipientId,
                    ...request,
                  });
                }));
          }),    
        ),
        openDeleteRecipientDialog: events.on(recipientEvents.deleteRecipient).pipe(
          exhaustMap(({ payload }) => {
            return dialogService.openConfirmationDialog({
              title: 'Törölni akarod ezt a partnert?',
              content: payload.name,
            }).pipe(
              dispatchIfConfirmed(recipientApiEvents.deleteRecipientInitiated({
                recipientId: payload.recipientId,
              })),
            );
          }),
        ),
        openRecipientListItemSubmenu: events.on(recipientEvents.openRecipientListItemSubmenu)
          .pipe(
            exhaustMap(({ payload }) => {
              return bottomSheetService.openBottomSubmenu(payload.name, 'edit', 'merge', 'delete')
                .afterDismissed()
                .pipe(
                  filter(value => !!value),
                  map((value) => {
                    switch(value) {
                      case 'edit': return recipientEvents.updateRecipient(payload);
                      case 'delete': return recipientEvents.deleteRecipient(payload);
                      case 'merge': return recipientEvents.mergeRecipients(payload);
                    }
                  }),
                );
            }),
          ),
        openMergeRecipientsDialog: events.on(recipientEvents.mergeRecipients)
          .pipe(
            exhaustMap(({ payload }) => {
              return dialog.open<RecipientMergeDialog, RecipientMergeDialogData, RecipientMergeDialogResult>(RecipientMergeDialog, {
                disableClose: true,
                data: payload,
                width: '90vw',
                height: '80vh',
              }).afterClosed();
            }),
            filter(req => !!req),
            map((request) => {
              return recipientApiEvents.mergeRecipientsInitiated(request);
            }),
          ),
      };
    },
    ),
  );
};
