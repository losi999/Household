import { TestBed } from '@angular/core/testing';
import { BottomSheetService, createDispatcherSpy, DialogService, validateDispatcher } from '@household/shared-ui';
import { Dispatcher } from '@ngrx/signals/events';
import { signalStore } from '@ngrx/signals';
import { Mock } from 'vitest';
import { createMockService, MockService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { accountApiEvents, accountEvents } from '@household/state/account/account-events';
import { withAccountEvents } from '@household/state/account/with-account-events';
import { AccountDialog } from '@household/app/account/account-dialog/account-dialog';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { of } from 'rxjs';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';

describe('withAccountEvents', () => {
  let dispatcher: Dispatcher;
  let dispatchSpy: Mock;
  let mockMatDialog: MockService<MatDialog>;
  let mockBottomSheetService: MockService<BottomSheetService>;
  let mockDialogService: MockService<DialogService>;

  const setup = () => {
    TestBed.resetTestingModule();

    mockMatDialog = createMockService('open');
    mockBottomSheetService = createMockService('openBottomSubmenu');
    mockDialogService = createMockService('openConfirmationDialog');

    TestBed.configureTestingModule({
      providers: [
        {
          provide: MatDialog,
          useValue: mockMatDialog.service,
        },
        {
          provide: BottomSheetService,
          useValue: mockBottomSheetService.service,
        },
        {
          provide: DialogService,
          useValue: mockDialogService.service,
        },
      ],
    });

    TestBed.inject(signalStore({
      providedIn: 'root',
    }, withAccountEvents()));
    dispatcher = TestBed.inject(Dispatcher);
    dispatchSpy = createDispatcherSpy(dispatcher);
  };

  const dismissWith = (value: 'edit' | 'open' | 'close' | 'delete' | undefined) => {
    mockBottomSheetService.functions.openBottomSubmenu.mockReturnValue({
      afterDismissed: () => of(value),
    } as MatBottomSheetRef);
  };

  beforeEach(() => {
    setup();
  });

  describe('dispatching createAccount', () => {
    it('should open dialog and dispatch if submitted', () => {
      const accountRequest = testDataFactory.account.request();
      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of(accountRequest),
      } as MatDialogRef<any>);

      dispatcher.dispatch(accountEvents.createAccount());

      validateFunctionCall(mockMatDialog.functions.open, AccountDialog, {
        disableClose: true,
      });
      validateDispatcher(dispatchSpy, accountApiEvents.createAccountInitiated(accountRequest));
    });

    it('should open dialog and not dispatch anything if cancelled', () => {
      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of(undefined),
      } as MatDialogRef<any>);

      dispatcher.dispatch(accountEvents.createAccount());

      validateFunctionCall(mockMatDialog.functions.open, AccountDialog, {
        disableClose: true,
      });
      validateDispatcher(dispatchSpy);
    });
  });

  describe('dispatching updateAccount', () => {
    const account = testDataFactory.account.response();
    const accountRequest = testDataFactory.account.request();

    it('should open dialog and dispatch if submitted', () => {
      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of(accountRequest),
      } as MatDialogRef<any>);

      dispatcher.dispatch(accountEvents.updateAccount(account));

      validateFunctionCall(mockMatDialog.functions.open, AccountDialog, {
        data: account,
        disableClose: true,
      });
      validateDispatcher(dispatchSpy, accountApiEvents.updateAccountInitiated({
        accountId: account.accountId,
        ...accountRequest,
      }));
    });

    it('should open dialog and not dispatch anything if cancelled', () => {
      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of(undefined),
      } as MatDialogRef<any>);

      dispatcher.dispatch(accountEvents.updateAccount(account));

      validateFunctionCall(mockMatDialog.functions.open, AccountDialog, {
        data: account,
        disableClose: true,
      });
      validateDispatcher(dispatchSpy);
    });
  });

  describe('dispatching deleteAccount', () => {
    const account = testDataFactory.account.response();

    it('should open dialog warning about the transactions and dispatch if confirmed', () => {
      mockDialogService.functions.openConfirmationDialog.mockReturnValue(of(true));

      dispatcher.dispatch(accountEvents.deleteAccount(account));

      validateFunctionCall(mockDialogService.functions.openConfirmationDialog, {
        title: 'Törölni akarod ezt a számlát?',
        content: `${account.name}. A számla összes tranzakciója is törlődik!`,
      });
      validateDispatcher(dispatchSpy, accountApiEvents.deleteAccountInitiated({
        accountId: account.accountId,
      }));
    });

    it('should open dialog and not dispatch anything if cancelled', () => {
      mockDialogService.functions.openConfirmationDialog.mockReturnValue(of(false));

      dispatcher.dispatch(accountEvents.deleteAccount(account));

      validateFunctionCall(mockDialogService.functions.openConfirmationDialog, {
        title: 'Törölni akarod ezt a számlát?',
        content: `${account.name}. A számla összes tranzakciója is törlődik!`,
      });
      validateDispatcher(dispatchSpy);
    });
  });

  describe('dispatching closeAccount', () => {
    const account = testDataFactory.account.response({
      isOpen: true,
    });

    it('should open dialog and dispatch if confirmed', () => {
      mockDialogService.functions.openConfirmationDialog.mockReturnValue(of(true));

      dispatcher.dispatch(accountEvents.closeAccount(account));

      validateFunctionCall(mockDialogService.functions.openConfirmationDialog, {
        title: 'Le akarod zárni ezt a számlát?',
        content: account.name,
      });
      validateDispatcher(dispatchSpy, accountApiEvents.closeAccountInitiated({
        accountId: account.accountId,
      }));
    });

    it('should open dialog and not dispatch anything if cancelled', () => {
      mockDialogService.functions.openConfirmationDialog.mockReturnValue(of(false));

      dispatcher.dispatch(accountEvents.closeAccount(account));

      validateFunctionCall(mockDialogService.functions.openConfirmationDialog, {
        title: 'Le akarod zárni ezt a számlát?',
        content: account.name,
      });
      validateDispatcher(dispatchSpy);
    });
  });

  describe('dispatching openAccount', () => {
    const account = testDataFactory.account.response({
      isOpen: false,
    });

    it('should open dialog and dispatch if confirmed', () => {
      mockDialogService.functions.openConfirmationDialog.mockReturnValue(of(true));

      dispatcher.dispatch(accountEvents.openAccount(account));

      validateFunctionCall(mockDialogService.functions.openConfirmationDialog, {
        title: 'Újra akarod nyitni ezt a számlát?',
        content: account.name,
      });
      validateDispatcher(dispatchSpy, accountApiEvents.openAccountInitiated({
        accountId: account.accountId,
      }));
    });

    it('should open dialog and not dispatch anything if cancelled', () => {
      mockDialogService.functions.openConfirmationDialog.mockReturnValue(of(false));

      dispatcher.dispatch(accountEvents.openAccount(account));

      validateFunctionCall(mockDialogService.functions.openConfirmationDialog, {
        title: 'Újra akarod nyitni ezt a számlát?',
        content: account.name,
      });
      validateDispatcher(dispatchSpy);
    });
  });

  describe('dispatching openAccountListItemSubmenu for an open account', () => {
    const account = testDataFactory.account.response({
      isOpen: true,
    });
    const items = [
      'edit',
      'close',
      'delete',
    ] as const;

    it('should open bottom sheet and dispatch if edit is selected', () => {
      dismissWith('edit');

      dispatcher.dispatch(accountEvents.openAccountListItemSubmenu(account));

      validateFunctionCall(mockBottomSheetService.functions.openBottomSubmenu, account.name, ...items);
      validateDispatcher(dispatchSpy, accountEvents.updateAccount(account));
    });

    it('should open bottom sheet and dispatch if close is selected', () => {
      dismissWith('close');

      dispatcher.dispatch(accountEvents.openAccountListItemSubmenu(account));

      validateFunctionCall(mockBottomSheetService.functions.openBottomSubmenu, account.name, ...items);
      validateDispatcher(dispatchSpy, accountEvents.closeAccount(account));
    });

    it('should open bottom sheet and dispatch if delete is selected', () => {
      dismissWith('delete');

      dispatcher.dispatch(accountEvents.openAccountListItemSubmenu(account));

      validateFunctionCall(mockBottomSheetService.functions.openBottomSubmenu, account.name, ...items);
      validateDispatcher(dispatchSpy, accountEvents.deleteAccount(account));
    });

    it('should open bottom sheet and not dispatch anything if cancelled', () => {
      dismissWith(undefined);

      dispatcher.dispatch(accountEvents.openAccountListItemSubmenu(account));

      validateFunctionCall(mockBottomSheetService.functions.openBottomSubmenu, account.name, ...items);
      validateDispatcher(dispatchSpy);
    });
  });

  describe('dispatching openAccountListItemSubmenu for a closed account', () => {
    const account = testDataFactory.account.response({
      isOpen: false,
    });
    const items = [
      'edit',
      'open',
      'delete',
    ] as const;

    it('should open bottom sheet and dispatch if edit is selected', () => {
      dismissWith('edit');

      dispatcher.dispatch(accountEvents.openAccountListItemSubmenu(account));

      validateFunctionCall(mockBottomSheetService.functions.openBottomSubmenu, account.name, ...items);
      validateDispatcher(dispatchSpy, accountEvents.updateAccount(account));
    });

    it('should open bottom sheet and dispatch if open is selected', () => {
      dismissWith('open');

      dispatcher.dispatch(accountEvents.openAccountListItemSubmenu(account));

      validateFunctionCall(mockBottomSheetService.functions.openBottomSubmenu, account.name, ...items);
      validateDispatcher(dispatchSpy, accountEvents.openAccount(account));
    });

    it('should open bottom sheet and dispatch if delete is selected', () => {
      dismissWith('delete');

      dispatcher.dispatch(accountEvents.openAccountListItemSubmenu(account));

      validateFunctionCall(mockBottomSheetService.functions.openBottomSubmenu, account.name, ...items);
      validateDispatcher(dispatchSpy, accountEvents.deleteAccount(account));
    });

    it('should open bottom sheet and not dispatch anything if cancelled', () => {
      dismissWith(undefined);

      dispatcher.dispatch(accountEvents.openAccountListItemSubmenu(account));

      validateFunctionCall(mockBottomSheetService.functions.openBottomSubmenu, account.name, ...items);
      validateDispatcher(dispatchSpy);
    });
  });
});
