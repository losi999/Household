// The dialogs opened by the event handlers import the store, which imports the event handlers back. Loading the store
// first resolves that cycle in the same order as the application does.
import '@household/state/recipient/recipient-store';
import { TestBed } from '@angular/core/testing';
import { BottomSheetService, createDispatcherSpy, DialogService, validateDispatcher } from '@household/shared-ui';
import { Dispatcher } from '@ngrx/signals/events';
import { signalStore } from '@ngrx/signals';
import { Mock } from 'vitest';
import { createMockService, MockService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { recipientApiEvents, recipientEvents } from '@household/state/recipient/recipient-events';
import { withRecipientEvents } from '@household/state/recipient/with-recipient-events';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { of } from 'rxjs';
import { RecipientDialog } from '@household/app/recipient/recipient-dialog/recipient-dialog';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { RecipientMergeDialog } from '@household/app/recipient/recipient-merge-dialog/recipient-merge-dialog';

describe('withRecipientEvents', () => {
  let dispatcher: Dispatcher;
  let dispatchSpy: Mock;
  let mockDialogService: MockService<DialogService>;
  let mockMatDialog: MockService<MatDialog>;
  let mockBottomSheetService: MockService<BottomSheetService>;

  const setup = () => {
    TestBed.resetTestingModule();

    mockDialogService = createMockService('openConfirmationDialog');
    mockBottomSheetService = createMockService('openBottomSubmenu');
    mockMatDialog = createMockService('open');

    TestBed.configureTestingModule({
      providers: [
        {
          provide: MatDialog,
          useValue: mockMatDialog.service,
        },
        {
          provide: DialogService,
          useValue: mockDialogService.service,
        },
        {
          provide: BottomSheetService,
          useValue: mockBottomSheetService.service,
        },
      ],
    });

    TestBed.inject(signalStore({
      providedIn: 'root',
    }, withRecipientEvents()));
    dispatcher = TestBed.inject(Dispatcher);
    dispatchSpy = createDispatcherSpy(dispatcher);
  };

  beforeEach(() => {
    setup();
  });

  describe('dispatching createRecipient', () => {
    it('should open dialog and dispatch if submitted', () => {
      const recipientRequest = testDataFactory.recipient.request();

      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of(recipientRequest),
      } as MatDialogRef<any>);

      dispatcher.dispatch(recipientEvents.createRecipient());

      validateFunctionCall(mockMatDialog.functions.open, RecipientDialog, {
        disableClose: true,
      });
      validateDispatcher(dispatchSpy, recipientApiEvents.createRecipientInitiated(recipientRequest));
    });

    it('should open dialog and not dispatch anything if cancelled', () => {
      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of(undefined),
      } as MatDialogRef<any>);

      dispatcher.dispatch(recipientEvents.createRecipient());

      validateFunctionCall(mockMatDialog.functions.open, RecipientDialog, {
        disableClose: true,
      });
      validateDispatcher(dispatchSpy);
    });
  });

  describe('dispatching updateRecipient', () => {
    const recipientId = testDataFactory.recipient.id();
    const recipientRequest = testDataFactory.recipient.request();
    const recipientResponse = testDataFactory.recipient.response({
      recipientId,
    });

    it('should open dialog and dispatch if submitted', () => {
      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of(recipientRequest),
      } as MatDialogRef<any>);

      dispatcher.dispatch(recipientEvents.updateRecipient(recipientResponse));

      validateFunctionCall(mockMatDialog.functions.open, RecipientDialog, {
        disableClose: true,
        data: recipientResponse,
      });
      validateDispatcher(dispatchSpy, recipientApiEvents.updateRecipientInitiated({
        ...recipientRequest,
        recipientId,
      }));
    });

    it('should open dialog and not dispatch anything if cancelled', () => {
      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of(undefined),
      } as MatDialogRef<any>);

      dispatcher.dispatch(recipientEvents.updateRecipient(recipientResponse));

      validateFunctionCall(mockMatDialog.functions.open, RecipientDialog, {
        disableClose: true,
        data: recipientResponse,
      });
      validateDispatcher(dispatchSpy);
    });
  });

  describe('dispatching deleteRecipient', () => {
    const recipientResponse = testDataFactory.recipient.response();

    it('should open dialog and dispatch if confirmed', () => {
      mockDialogService.functions.openConfirmationDialog.mockReturnValue(of(true));

      dispatcher.dispatch(recipientEvents.deleteRecipient(recipientResponse));

      validateFunctionCall(mockDialogService.functions.openConfirmationDialog, {
        title: 'Törölni akarod ezt a partnert?',
        content: recipientResponse.name,
      });
      validateDispatcher(dispatchSpy, recipientApiEvents.deleteRecipientInitiated({
        recipientId: recipientResponse.recipientId,
      }));
    });

    it('should open dialog and not dispatch anything if cancelled', () => {
      mockDialogService.functions.openConfirmationDialog.mockReturnValue(of(false));

      dispatcher.dispatch(recipientEvents.deleteRecipient(recipientResponse));

      validateFunctionCall(mockDialogService.functions.openConfirmationDialog, {
        title: 'Törölni akarod ezt a partnert?',
        content: recipientResponse.name,
      });
      validateDispatcher(dispatchSpy);
    });
  });

  describe('dispatching mergeRecipients', () => {
    const recipientResponse = testDataFactory.recipient.response();
    const sourceRecipientId = testDataFactory.recipient.id();

    it('should open dialog and dispatch if submitted', () => {
      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of({
          sourceRecipientIds: [sourceRecipientId],
          targetRecipientId: recipientResponse.recipientId,
        }),
      } as MatDialogRef<any>);

      dispatcher.dispatch(recipientEvents.mergeRecipients(recipientResponse));

      validateFunctionCall(mockMatDialog.functions.open, RecipientMergeDialog, {
        disableClose: true,
        data: recipientResponse,
        height: '80vh',
        width: '90vw',
      });
      validateDispatcher(dispatchSpy, recipientApiEvents.mergeRecipientsInitiated({
        sourceRecipientIds: [sourceRecipientId],
        targetRecipientId: recipientResponse.recipientId,
      }));
    });

    it('should open dialog and not dispatch anything if cancelled', () => {
      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of(undefined),
      } as MatDialogRef<any>);

      dispatcher.dispatch(recipientEvents.mergeRecipients(recipientResponse));

      validateFunctionCall(mockMatDialog.functions.open, RecipientMergeDialog, {
        disableClose: true,
        data: recipientResponse,
        height: '80vh',
        width: '90vw',
      });
      validateDispatcher(dispatchSpy);
    });
  });

  describe('dispatching openRecipientListItemSubmenu', () => {
    const recipientResponse = testDataFactory.recipient.response();

    it('should open bottom sheet and dispatch if edit is selected', () => {
      mockBottomSheetService.functions.openBottomSubmenu.mockReturnValue({
        afterDismissed: () => of('edit'),
      } as MatBottomSheetRef);

      dispatcher.dispatch(recipientEvents.openRecipientListItemSubmenu(recipientResponse));

      validateFunctionCall(mockBottomSheetService.functions.openBottomSubmenu, recipientResponse.name, 'edit', 'merge', 'delete');
      validateDispatcher(dispatchSpy, recipientEvents.updateRecipient(recipientResponse));
    });

    it('should open bottom sheet and dispatch if merge is selected', () => {
      mockBottomSheetService.functions.openBottomSubmenu.mockReturnValue({
        afterDismissed: () => of('merge'),
      } as MatBottomSheetRef);

      dispatcher.dispatch(recipientEvents.openRecipientListItemSubmenu(recipientResponse));

      validateFunctionCall(mockBottomSheetService.functions.openBottomSubmenu, recipientResponse.name, 'edit', 'merge', 'delete');
      validateDispatcher(dispatchSpy, recipientEvents.mergeRecipients(recipientResponse));
    });

    it('should open bottom sheet and dispatch if delete is selected', () => {
      mockBottomSheetService.functions.openBottomSubmenu.mockReturnValue({
        afterDismissed: () => of('delete'),
      } as MatBottomSheetRef);

      dispatcher.dispatch(recipientEvents.openRecipientListItemSubmenu(recipientResponse));

      validateFunctionCall(mockBottomSheetService.functions.openBottomSubmenu, recipientResponse.name, 'edit', 'merge', 'delete');
      validateDispatcher(dispatchSpy, recipientEvents.deleteRecipient(recipientResponse));
    });

    it('should open bottom sheet and not dispatch anything if cancelled', () => {
      mockBottomSheetService.functions.openBottomSubmenu.mockReturnValue({
        afterDismissed: () => of(undefined),
      } as MatBottomSheetRef);

      dispatcher.dispatch(recipientEvents.openRecipientListItemSubmenu(recipientResponse));

      validateFunctionCall(mockBottomSheetService.functions.openBottomSubmenu, recipientResponse.name, 'edit', 'merge', 'delete');
      validateDispatcher(dispatchSpy);
    });
  });
});
