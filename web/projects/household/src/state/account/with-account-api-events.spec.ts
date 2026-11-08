import { TestBed } from '@angular/core/testing';
import { AccountService } from '@household/services/account-service';
import { createDispatcherSpy, notificationEvents, validateDispatcher } from '@household/shared-ui';
import { Dispatcher } from '@ngrx/signals/events';
import { signalStore } from '@ngrx/signals';
import { Mock } from 'vitest';
import { createMockService, MockService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { accountApiEvents } from '@household/state/account/account-events';
import { withAccountApiEvents } from '@household/state/account/with-account-api-events';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { of, throwError } from 'rxjs';

describe('withAccountApiEvents', () => {
  let dispatcher: Dispatcher;
  let dispatchSpy: Mock;
  let mockAccountService: MockService<AccountService>;

  const setup = () => {
    TestBed.resetTestingModule();

    mockAccountService = createMockService('listAccounts', 'createAccount', 'updateAccount', 'deleteAccount', 'openAccount', 'closeAccount');

    TestBed.configureTestingModule({
      providers: [
        {
          provide: AccountService,
          useValue: mockAccountService.service,
        },
      ],
    });

    TestBed.inject(signalStore({
      providedIn: 'root',
    }, withAccountApiEvents()));
    dispatcher = TestBed.inject(Dispatcher);
    dispatchSpy = createDispatcherSpy(dispatcher);
  };

  beforeEach(() => {
    setup();
  });

  describe('dispatching listAccountsInitiated', () => {
    it('should call API and dispatch response', () => {
      const accountList = [testDataFactory.account.response()];
      mockAccountService.functions.listAccounts.mockReturnValue(of(accountList));

      dispatcher.dispatch(accountApiEvents.listAccountsInitiated());

      expect(mockAccountService.functions.listAccounts).toHaveBeenCalled();
      validateDispatcher(dispatchSpy, accountApiEvents.listAccountsCompleted(accountList));
    });

    it('should call API and show notification if there is an error', () => {
      mockAccountService.functions.listAccounts.mockReturnValue(throwError(() => ({
        error: {
          message: 'There is an error',
        },
      })));

      dispatcher.dispatch(accountApiEvents.listAccountsInitiated());

      expect(mockAccountService.functions.listAccounts).toHaveBeenCalled();
      validateDispatcher(dispatchSpy, notificationEvents.showMessage('Hiba történt'));
    });
  });

  describe('dispatching createAccountInitiated', () => {
    const accountRequest = testDataFactory.account.request();
    const accountId = testDataFactory.account.id();

    it('should call API and dispatch response', () => {
      mockAccountService.functions.createAccount.mockReturnValue(of({
        accountId,
      }));

      dispatcher.dispatch(accountApiEvents.createAccountInitiated(accountRequest));

      validateFunctionCall(mockAccountService.functions.createAccount, accountRequest);
      validateDispatcher(dispatchSpy, accountApiEvents.createAccountCompleted({
        accountId,
        ...accountRequest,
      }));
    });

    it('should call API and show notification if account name is already taken', () => {
      mockAccountService.functions.createAccount.mockReturnValue(throwError(() => ({
        error: {
          message: 'Duplicate account name',
        },
      })));

      dispatcher.dispatch(accountApiEvents.createAccountInitiated(accountRequest));

      validateFunctionCall(mockAccountService.functions.createAccount, accountRequest);
      validateDispatcher(dispatchSpy, notificationEvents.showMessage(`Számla (${accountRequest.name}) már létezik!`));
    });

    it('should call API and show notification if there is an error', () => {
      mockAccountService.functions.createAccount.mockReturnValue(throwError(() => ({
        error: {
          message: 'There is an error',
        },
      })));

      dispatcher.dispatch(accountApiEvents.createAccountInitiated(accountRequest));

      validateFunctionCall(mockAccountService.functions.createAccount, accountRequest);
      validateDispatcher(dispatchSpy, notificationEvents.showMessage('Hiba történt'));
    });
  });

  describe('dispatching updateAccountInitiated', () => {
    const accountRequest = testDataFactory.account.request();
    const accountId = testDataFactory.account.id();

    it('should call API and dispatch response', () => {
      mockAccountService.functions.updateAccount.mockReturnValue(of(undefined));

      dispatcher.dispatch(accountApiEvents.updateAccountInitiated({
        accountId,
        ...accountRequest,
      }));

      validateFunctionCall(mockAccountService.functions.updateAccount, accountId, accountRequest);
      validateDispatcher(dispatchSpy, accountApiEvents.updateAccountCompleted({
        accountId,
        ...accountRequest,
      }));
    });

    it('should call API and show notification if account name is already taken', () => {
      mockAccountService.functions.updateAccount.mockReturnValue(throwError(() => ({
        error: {
          message: 'Duplicate account name',
        },
      })));

      dispatcher.dispatch(accountApiEvents.updateAccountInitiated({
        accountId,
        ...accountRequest,
      }));

      validateFunctionCall(mockAccountService.functions.updateAccount, accountId, accountRequest);
      validateDispatcher(dispatchSpy, accountApiEvents.updateAccountFailed({
        accountId,
      }), notificationEvents.showMessage(`Számla (${accountRequest.name}) már létezik!`));
    });

    it('should call API and show notification if there is an error', () => {
      mockAccountService.functions.updateAccount.mockReturnValue(throwError(() => ({
        error: {
          message: 'There is an error',
        },
      })));

      dispatcher.dispatch(accountApiEvents.updateAccountInitiated({
        accountId,
        ...accountRequest,
      }));

      validateFunctionCall(mockAccountService.functions.updateAccount, accountId, accountRequest);
      validateDispatcher(dispatchSpy, accountApiEvents.updateAccountFailed({
        accountId,
      }), notificationEvents.showMessage('Hiba történt'));
    });
  });

  describe('dispatching deleteAccountInitiated', () => {
    const accountId = testDataFactory.account.id();

    it('should call API and dispatch response', () => {
      mockAccountService.functions.deleteAccount.mockReturnValue(of(undefined));

      dispatcher.dispatch(accountApiEvents.deleteAccountInitiated({
        accountId,
      }));

      validateFunctionCall(mockAccountService.functions.deleteAccount, accountId);
      validateDispatcher(dispatchSpy, accountApiEvents.deleteAccountCompleted({
        accountId,
      }));
    });

    it('should call API and show notification if there is an error', () => {
      mockAccountService.functions.deleteAccount.mockReturnValue(throwError(() => ({
        error: {
          message: 'There is an error',
        },
      })));

      dispatcher.dispatch(accountApiEvents.deleteAccountInitiated({
        accountId,
      }));

      validateFunctionCall(mockAccountService.functions.deleteAccount, accountId);
      validateDispatcher(dispatchSpy, accountApiEvents.deleteAccountFailed({
        accountId,
      }), notificationEvents.showMessage('Hiba történt'));
    });
  });

  describe('dispatching openAccountInitiated', () => {
    const accountId = testDataFactory.account.id();

    it('should call API and dispatch response', () => {
      mockAccountService.functions.openAccount.mockReturnValue(of(undefined));

      dispatcher.dispatch(accountApiEvents.openAccountInitiated({
        accountId,
      }));

      validateFunctionCall(mockAccountService.functions.openAccount, accountId);
      validateDispatcher(dispatchSpy, accountApiEvents.openAccountCompleted({
        accountId,
      }));
    });

    it('should call API and show notification if there is an error', () => {
      mockAccountService.functions.openAccount.mockReturnValue(throwError(() => ({
        error: {
          message: 'There is an error',
        },
      })));

      dispatcher.dispatch(accountApiEvents.openAccountInitiated({
        accountId,
      }));

      validateFunctionCall(mockAccountService.functions.openAccount, accountId);
      validateDispatcher(dispatchSpy, accountApiEvents.openAccountFailed({
        accountId,
      }), notificationEvents.showMessage('Hiba történt'));
    });
  });

  describe('dispatching closeAccountInitiated', () => {
    const accountId = testDataFactory.account.id();

    it('should call API and dispatch response', () => {
      mockAccountService.functions.closeAccount.mockReturnValue(of(undefined));

      dispatcher.dispatch(accountApiEvents.closeAccountInitiated({
        accountId,
      }));

      validateFunctionCall(mockAccountService.functions.closeAccount, accountId);
      validateDispatcher(dispatchSpy, accountApiEvents.closeAccountCompleted({
        accountId,
      }));
    });

    it('should call API and show notification if there is an error', () => {
      mockAccountService.functions.closeAccount.mockReturnValue(throwError(() => ({
        error: {
          message: 'There is an error',
        },
      })));

      dispatcher.dispatch(accountApiEvents.closeAccountInitiated({
        accountId,
      }));

      validateFunctionCall(mockAccountService.functions.closeAccount, accountId);
      validateDispatcher(dispatchSpy, accountApiEvents.closeAccountFailed({
        accountId,
      }), notificationEvents.showMessage('Hiba történt'));
    });
  });
});
