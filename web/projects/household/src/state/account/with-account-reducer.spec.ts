import { TestBed } from '@angular/core/testing';
import { Dispatcher } from '@ngrx/signals/events';
import { signalStore, withState } from '@ngrx/signals';
import { accountApiEvents, accountEvents } from '@household/state/account/account-events';
import { AccountState } from '@household/state/account/account-store';
import { withAccountReducer } from '@household/state/account/with-account-reducer';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { toSearchable } from '@household/shared/common/utils';
import { AccountType } from '@household/shared/enums';

const createTestStore = (state: AccountState) => {
  return signalStore({
    providedIn: 'root',
  }, withState<AccountState>(state), withAccountReducer());
};

describe('withAccountReducer', () => {
  let initialState: AccountState;
  let store: InstanceType<ReturnType<typeof createTestStore>>;
  let dispatcher: Dispatcher;

  const validateState = (currentValue?: Partial<AccountState>) => {
    expect(store.isInProgress(), 'isInProgress').toEqual(Object.hasOwn(currentValue ?? {}, 'isInProgress') ? currentValue.isInProgress : initialState.isInProgress);
    expect(store.pendingAccount(), 'pendingAccount').toEqual(Object.hasOwn(currentValue ?? {}, 'pendingAccount') ? currentValue.pendingAccount : initialState.pendingAccount);
    expect(store.accountList(), 'accountList').toEqual(Object.hasOwn(currentValue ?? {}, 'accountList') ? currentValue.accountList : initialState.accountList);
  };

  const setup = (initial?: Partial<AccountState>) => {
    TestBed.resetTestingModule();

    initialState = {
      accountList: [],
      isInProgress: [],
      pendingAccount: undefined,
      ...initial,
    };

    store = TestBed.inject(createTestStore(initialState));
    dispatcher = TestBed.inject(Dispatcher);
  };

  beforeEach(() => {
    setup();
  });

  describe('selectAccount', () => {
    it('should clear the pending account', () => {
      setup({
        pendingAccount: testDataFactory.account.response(),
      });

      dispatcher.dispatch(accountEvents.selectAccount([toSearchable(testDataFactory.account.response(), ['name'])]));

      validateState({
        pendingAccount: undefined,
      });
    });
  });

  describe('accountSelected', () => {
    it('should store the selected account as the pending account', () => {
      const accountResponse = testDataFactory.account.response();

      dispatcher.dispatch(accountEvents.accountSelected(accountResponse));

      validateState({
        pendingAccount: accountResponse,
      });
    });
  });

  describe('listAccountsCompleted', () => {
    it('should store the accounts in the given order', () => {
      const account1 = testDataFactory.account.response();
      const account2 = testDataFactory.account.response();

      dispatcher.dispatch(accountApiEvents.listAccountsCompleted([
        account1,
        account2,
      ]));

      validateState({
        accountList: [
          toSearchable(account1, ['name']),
          toSearchable(account2, ['name']),
        ],
      });
    });

    it('should replace the previously stored accounts', () => {
      setup({
        accountList: [testDataFactory.account.response()],
      });
      const account = testDataFactory.account.response();

      dispatcher.dispatch(accountApiEvents.listAccountsCompleted([account]));

      validateState({
        accountList: [toSearchable(account, ['name'])],
      });
    });

    it('should make the accounts searchable by their name, ignoring accents', () => {
      const account = testDataFactory.account.response({
        name: 'ékezetes név',
      });

      dispatcher.dispatch(accountApiEvents.listAccountsCompleted([account]));

      expect(store.accountList()[0].searchTerms).toEqual(expect.arrayContaining([
        'ekezetes',
        'nev',
        'ékezetes',
        'név',
      ]));
    });
  });

  describe('createAccountCompleted', () => {
    it('should add an open account with no balance', () => {
      const accountId = testDataFactory.account.id();
      const request = testDataFactory.account.request({
        name: 'account name',
        currency: 'Ft',
        accountType: AccountType.Cash,
      });

      dispatcher.dispatch(accountApiEvents.createAccountCompleted({
        accountId,
        ...request,
      }));

      validateState({
        accountList: [
          toSearchable({
            accountId,
            name: 'account name',
            currency: 'Ft',
            accountType: AccountType.Cash,
            isOpen: true,
            balance: 0,
          }, ['name']),
        ],
      });
    });

    it('should keep the accounts ordered by name', () => {
      const accountA = testDataFactory.account.response({
        name: 'a account',
      });
      const accountC = testDataFactory.account.response({
        name: 'c account',
      });
      const accountId = testDataFactory.account.id();
      setup({
        accountList: [
          accountA,
          accountC,
        ],
      });

      dispatcher.dispatch(accountApiEvents.createAccountCompleted({
        accountId,
        ...testDataFactory.account.request({
          name: 'b account',
        }),
      }));

      expect(store.accountList().map(account => account.name)).toEqual([
        'a account',
        'b account',
        'c account',
      ]);
    });
  });

  describe('updateAccountInitiated', () => {
    it('should mark the account as in progress', () => {
      const account = testDataFactory.account.response();
      const otherAccountId = testDataFactory.account.id();
      setup({
        isInProgress: [otherAccountId],
        accountList: [toSearchable(account, ['name'])],
      });

      dispatcher.dispatch(accountApiEvents.updateAccountInitiated({
        accountId: account.accountId,
        ...testDataFactory.account.request(),
      }));

      validateState({
        isInProgress: [
          otherAccountId,
          account.accountId,
        ],
      });
    });
  });

  describe('updateAccountFailed', () => {
    it('should clear the in progress flag of the account', () => {
      const account = testDataFactory.account.response();
      const otherAccountId = testDataFactory.account.id();
      setup({
        isInProgress: [
          otherAccountId,
          account.accountId,
        ],
        accountList: [toSearchable(account, ['name'])],
      });

      dispatcher.dispatch(accountApiEvents.updateAccountFailed({
        accountId: account.accountId,
      }));

      validateState({
        isInProgress: [otherAccountId],
      });
    });
  });

  describe('updateAccountCompleted', () => {
    it('should replace the account keeping whether it is open and its balance, and clear its in progress flag', () => {
      const account = testDataFactory.account.response({
        name: 'a account',
        isOpen: false,
        balance: 1234,
      });
      const otherAccount = toSearchable(testDataFactory.account.response({
        name: 'b account',
      }), ['name']);
      setup({
        isInProgress: [account.accountId],
        accountList: [
          toSearchable(account, ['name']),
          otherAccount,
        ],
      });

      dispatcher.dispatch(accountApiEvents.updateAccountCompleted({
        accountId: account.accountId,
        name: 'updated name',
        currency: 'EUR',
        accountType: AccountType.Cash,
      }));

      validateState({
        isInProgress: [],
        accountList: [
          otherAccount,
          toSearchable({
            accountId: account.accountId,
            name: 'updated name',
            currency: 'EUR',
            accountType: AccountType.Cash,
            isOpen: false,
            balance: 1234,
          }, ['name']),
        ],
      });
    });

    it('should make the updated account searchable by its new name', () => {
      const account = testDataFactory.account.response();
      setup({
        accountList: [toSearchable(account, ['name'])],
      });

      dispatcher.dispatch(accountApiEvents.updateAccountCompleted({
        accountId: account.accountId,
        name: 'ékezetes név',
        currency: account.currency,
        accountType: account.accountType,
      }));

      expect(store.accountList()[0].searchTerms).toEqual(expect.arrayContaining([
        'ekezetes',
        'nev',
        'ékezetes',
        'név',
      ]));
    });
  });

  describe('deleteAccountInitiated', () => {
    it('should mark the account as in progress', () => {
      const account = testDataFactory.account.response();
      const otherAccountId = testDataFactory.account.id();
      setup({
        isInProgress: [otherAccountId],
        accountList: [toSearchable(account, ['name'])],
      });

      dispatcher.dispatch(accountApiEvents.deleteAccountInitiated({
        accountId: account.accountId,
      }));

      validateState({
        isInProgress: [
          otherAccountId,
          account.accountId,
        ],
      });
    });
  });

  describe('deleteAccountFailed', () => {
    it('should clear the in progress flag of the account', () => {
      const account = testDataFactory.account.response();
      const otherAccountId = testDataFactory.account.id();
      setup({
        isInProgress: [
          otherAccountId,
          account.accountId,
        ],
        accountList: [toSearchable(account, ['name'])],
      });

      dispatcher.dispatch(accountApiEvents.deleteAccountFailed({
        accountId: account.accountId,
      }));

      validateState({
        isInProgress: [otherAccountId],
      });
    });
  });

  describe('deleteAccountCompleted', () => {
    it('should remove the account and clear its in progress flag', () => {
      const accountToDelete = toSearchable(testDataFactory.account.response(), ['name']);
      const otherAccount = toSearchable(testDataFactory.account.response(), ['name']);
      const otherAccountId = testDataFactory.account.id();
      setup({
        isInProgress: [
          otherAccountId,
          accountToDelete.accountId,
        ],
        accountList: [
          accountToDelete,
          otherAccount,
        ],
      });

      dispatcher.dispatch(accountApiEvents.deleteAccountCompleted({
        accountId: accountToDelete.accountId,
      }));

      validateState({
        isInProgress: [otherAccountId],
        accountList: [otherAccount],
      });
    });
  });

  describe('openAccountInitiated', () => {
    it('should mark the account as in progress', () => {
      const account = testDataFactory.account.response();
      const otherAccountId = testDataFactory.account.id();
      setup({
        isInProgress: [otherAccountId],
        accountList: [toSearchable(account, ['name'])],
      });

      dispatcher.dispatch(accountApiEvents.openAccountInitiated({
        accountId: account.accountId,
      }));

      validateState({
        isInProgress: [
          otherAccountId,
          account.accountId,
        ],
      });
    });
  });

  describe('openAccountFailed', () => {
    it('should clear the in progress flag of the account', () => {
      const account = testDataFactory.account.response();
      const otherAccountId = testDataFactory.account.id();
      setup({
        isInProgress: [
          otherAccountId,
          account.accountId,
        ],
        accountList: [toSearchable(account, ['name'])],
      });

      dispatcher.dispatch(accountApiEvents.openAccountFailed({
        accountId: account.accountId,
      }));

      validateState({
        isInProgress: [otherAccountId],
      });
    });
  });

  describe('openAccountCompleted', () => {
    it('should set the status of the account and clear its in progress flag', () => {
      const account = toSearchable(testDataFactory.account.response({
        isOpen: false,
      }), ['name']);
      const otherAccount = toSearchable(testDataFactory.account.response({
        isOpen: false,
      }), ['name']);
      const otherAccountId = testDataFactory.account.id();
      setup({
        isInProgress: [
          otherAccountId,
          account.accountId,
        ],
        accountList: [
          account,
          otherAccount,
        ],
      });

      dispatcher.dispatch(accountApiEvents.openAccountCompleted({
        accountId: account.accountId,
      }));

      validateState({
        isInProgress: [otherAccountId],
        accountList: [
          {
            ...account,
            isOpen: true,
          },
          otherAccount,
        ],
      });
    });
  });

  describe('closeAccountInitiated', () => {
    it('should mark the account as in progress', () => {
      const account = testDataFactory.account.response();
      const otherAccountId = testDataFactory.account.id();
      setup({
        isInProgress: [otherAccountId],
        accountList: [toSearchable(account, ['name'])],
      });

      dispatcher.dispatch(accountApiEvents.closeAccountInitiated({
        accountId: account.accountId,
      }));

      validateState({
        isInProgress: [
          otherAccountId,
          account.accountId,
        ],
      });
    });
  });

  describe('closeAccountFailed', () => {
    it('should clear the in progress flag of the account', () => {
      const account = testDataFactory.account.response();
      const otherAccountId = testDataFactory.account.id();
      setup({
        isInProgress: [
          otherAccountId,
          account.accountId,
        ],
        accountList: [toSearchable(account, ['name'])],
      });

      dispatcher.dispatch(accountApiEvents.closeAccountFailed({
        accountId: account.accountId,
      }));

      validateState({
        isInProgress: [otherAccountId],
      });
    });
  });

  describe('closeAccountCompleted', () => {
    it('should set the status of the account and clear its in progress flag', () => {
      const account = toSearchable(testDataFactory.account.response({
        isOpen: true,
      }), ['name']);
      const otherAccount = toSearchable(testDataFactory.account.response({
        isOpen: true,
      }), ['name']);
      const otherAccountId = testDataFactory.account.id();
      setup({
        isInProgress: [
          otherAccountId,
          account.accountId,
        ],
        accountList: [
          account,
          otherAccount,
        ],
      });

      dispatcher.dispatch(accountApiEvents.closeAccountCompleted({
        accountId: account.accountId,
      }));

      validateState({
        isInProgress: [otherAccountId],
        accountList: [
          {
            ...account,
            isOpen: false,
          },
          otherAccount,
        ],
      });
    });
  });
});
