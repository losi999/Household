import { TestBed } from '@angular/core/testing';
import { AccountService } from '@household/services/account-service';
import { AccountState, AccountStore, provideAccountStoreInitialState } from '@household/state/account/account-store';
import { Dispatcher } from '@ngrx/signals/events';
import { MatDialog } from '@angular/material/dialog';
import { BottomSheetService, DialogService } from '@household/shared-ui';
import { AccountDialog } from '@household/app/account/account-dialog/account-dialog';
import { createMockService, MockService } from '@household/shared/common/unit-testing';
import { accountApiEvents, accountEvents } from '@household/state/account/account-events';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { toSearchable } from '@household/shared/common/utils';
import { of } from 'rxjs';

// The behavior of each store feature is covered in its own spec (with-account-reducer.spec.ts,
// with-account-events.spec.ts, with-account-api-events.spec.ts). This spec only verifies that the store provides its initial
// state and has every feature wired in.
describe('Account store', () => {
  let initialState: AccountState;
  let store: InstanceType<typeof AccountStore>;
  let dispatcher: Dispatcher;
  let mockAccountService: MockService<AccountService>;
  let mockMatDialog: MockService<MatDialog>;
  let mockBottomSheetService: MockService<BottomSheetService>;
  let mockDialogService: MockService<DialogService>;

  const setup = (initial?: Partial<AccountState>) => {
    TestBed.resetTestingModule();

    initialState = {
      accountList: [],
      isInProgress: [],
      pendingAccount: undefined,
      ...initial,
    };

    mockAccountService = createMockService('listAccounts', 'createAccount', 'updateAccount', 'deleteAccount');
    mockMatDialog = createMockService('open');
    mockBottomSheetService = createMockService('openBottomSubmenu');
    mockDialogService = createMockService('openConfirmationDialog');

    TestBed.configureTestingModule({
      providers: [
        {
          provide: AccountService,
          useValue: mockAccountService.service,
        },
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
        provideAccountStoreInitialState(initialState),
      ],
    });

    store = TestBed.inject(AccountStore);
    dispatcher = TestBed.inject(Dispatcher);
  };

  it('should initialize with the provided state', () => {
    const accountList = [testDataFactory.account.response()];
    const isInProgress = [testDataFactory.account.id()];
    const pendingAccount = testDataFactory.account.response();

    setup({
      accountList,
      isInProgress,
      pendingAccount,
    });

    expect(store.accountList()).toEqual(accountList);
    expect(store.isInProgress()).toEqual(isInProgress);
    expect(store.pendingAccount()).toEqual(pendingAccount);
  });

  it('should initialize with the default state', () => {
    setup();

    expect(store.accountList()).toEqual([]);
    expect(store.isInProgress()).toEqual([]);
    expect(store.pendingAccount()).toBeUndefined();
  });

  it('should have the reducer wired in', () => {
    setup();
    const account = testDataFactory.account.response();

    dispatcher.dispatch(accountApiEvents.listAccountsCompleted([account]));

    expect(store.accountList()).toEqual([toSearchable(account, ['name'])]);
  });

  it('should have the UI event handlers wired in', () => {
    setup();
    mockMatDialog.functions.open.mockReturnValue({
      afterClosed: () => of(undefined),
    } as any);

    dispatcher.dispatch(accountEvents.createAccount());

    expect(mockMatDialog.functions.open).toHaveBeenCalledWith(AccountDialog, expect.anything());
  });

  it('should have the account selection working with the dialog and the reducer', () => {
    setup();
    const account = testDataFactory.account.response();
    mockMatDialog.functions.open.mockReturnValue({
      afterClosed: () => of(account),
    } as any);

    dispatcher.dispatch(accountEvents.selectAccount(undefined));

    expect(store.pendingAccount()).toEqual(account);
  });

  it('should have the submenu handler wired in', () => {
    setup();
    mockBottomSheetService.functions.openBottomSubmenu.mockReturnValue({
      afterDismissed: () => of(undefined),
    } as any);

    dispatcher.dispatch(accountEvents.openAccountListItemSubmenu(testDataFactory.account.response()));

    expect(mockBottomSheetService.functions.openBottomSubmenu).toHaveBeenCalled();
  });

  it('should have the API event handlers and the reducer working together', () => {
    setup();
    const account = testDataFactory.account.response();
    mockAccountService.functions.listAccounts.mockReturnValue(of([account]));

    dispatcher.dispatch(accountApiEvents.listAccountsInitiated());

    expect(mockAccountService.functions.listAccounts).toHaveBeenCalled();
    expect(store.accountList()).toEqual([toSearchable(account, ['name'])]);
  });
});
