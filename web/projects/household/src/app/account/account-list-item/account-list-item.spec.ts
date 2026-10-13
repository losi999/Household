import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccountListItem } from './account-list-item';
import { elementSelectorFactory, IElementSelector, MockSignalStore, provideMockDispatcher, provideMockSignalStore } from '@household/shared-ui';
import { AccountStore } from '@household/state/account/account-store';
import { accountEvents } from '@household/state/account/account-events';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { validateFunctionCall } from '@household/shared/common/unit-testing';
import { Dispatcher } from '@ngrx/signals/events';
import { MatListItem, MatListItemIcon, MatListItemLine, MatListItemTitle } from '@angular/material/list';
import { AccountType } from '@household/shared/enums';
import { Api } from '@household/shared/types/api';
import { Responses } from '@household/shared/types/responses';

describe('AccountListItem', () => {
  let fixture: ComponentFixture<AccountListItem>;
  let selector: IElementSelector;
  let mockAccountStore: MockSignalStore<typeof AccountStore>;
  let mockDispatcher: Dispatcher;

  const account = testDataFactory.account.response();

  const render = async (params?: {
    account?: Responses.Account;
    isInProgress?: Api.Account.Id[];
  }) => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [AccountListItem],
      providers: [
        provideMockSignalStore(AccountStore, 'isInProgress'),
        provideMockDispatcher(),
      ],
    })
      .compileComponents();

    mockAccountStore = TestBed.inject<MockSignalStore<typeof AccountStore>>(AccountStore);
    mockDispatcher = TestBed.inject(Dispatcher);

    mockAccountStore.isInProgress.set(params?.isInProgress ?? []);

    fixture = TestBed.createComponent(AccountListItem);
    fixture.componentRef.setInput('account', params?.account ?? account);

    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  };

  describe('list item button', () => {
    const getElement = () => {
      return selector.getComponent<MatListItem, HTMLButtonElement>(MatListItem);
    };

    it('should be rendered', async () => {
      await render();

      expect(getElement()).toBeTruthy();
    });

    it('should be enabled if account is not in progress', async () => {
      await render({
        isInProgress: [testDataFactory.account.id()],
      });

      expect(getElement().nativeElement.disabled).toBe(false);
    });

    it('should be disabled if account is in progress', async () => {
      await render({
        isInProgress: [account.accountId],
      });

      expect(getElement().nativeElement.disabled).toBe(true);
    });

    describe('on click', () => {
      it('should dispatch openAccountListItemSubmenu', async () => {
        await render();

        getElement().nativeElement.click();

        validateFunctionCall(mockDispatcher.dispatch, accountEvents.openAccountListItemSubmenu(account), {
          scope: 'self',
        });
      });

      it('should not dispatch anything if disabled', async () => {
        await render({
          isInProgress: [account.accountId],
        });

        getElement().nativeElement.click();

        validateFunctionCall(mockDispatcher.dispatch);
      });
    });
  });

  describe('name', () => {
    it('should be rendered', async () => {
      await render();

      expect(selector.getComponent(MatListItemTitle, MatListItem).nativeElement.textContent).toBe(account.name);
    });
  });

  describe('icon', () => {
    const getIcon = () => {
      return selector.getComponent(MatListItemIcon, MatListItem).nativeElement.textContent;
    };

    it('should be rendered for bank account', async () => {
      await render({
        account: testDataFactory.account.response({
          accountType: AccountType.BankAccount,
        }),
      });

      expect(getIcon()).toBe('account_balance');
    });

    it('should be rendered for cash', async () => {
      await render({
        account: testDataFactory.account.response({
          accountType: AccountType.Cash,
        }),
      });

      expect(getIcon()).toBe('payments');
    });

    it('should be rendered for credit card', async () => {
      await render({
        account: testDataFactory.account.response({
          accountType: AccountType.CreditCard,
        }),
      });

      expect(getIcon()).toBe('credit_card');
    });

    it('should be rendered for loan', async () => {
      await render({
        account: testDataFactory.account.response({
          accountType: AccountType.Loan,
        }),
      });

      expect(getIcon()).toBe('request_quote');
    });

    it('should be rendered for cafeteria', async () => {
      await render({
        account: testDataFactory.account.response({
          accountType: AccountType.Cafeteria,
        }),
      });

      expect(getIcon()).toBe('restaurant');
    });
  });

  describe('host class', () => {
    it('should be added for a closed account', async () => {
      await render({
        account: testDataFactory.account.response({
          isOpen: false,
        }),
      });

      expect(fixture.nativeElement.classList.contains('closed')).toBe(true);
    });

    it('should not be added for an open account', async () => {
      await render({
        account: testDataFactory.account.response({
          isOpen: true,
        }),
      });

      expect(fixture.nativeElement.classList.contains('closed')).toBe(false);
    });

    it('should follow the account if it changes', async () => {
      await render({
        account: testDataFactory.account.response({
          isOpen: true,
        }),
      });

      fixture.componentRef.setInput('account', testDataFactory.account.response({
        isOpen: false,
      }));
      await fixture.whenStable();

      expect(fixture.nativeElement.classList.contains('closed')).toBe(true);
    });
  });

  describe('secondary line', () => {
    it('should not be rendered, only the name is displayed', async () => {
      await render();

      expect(selector.getComponent(MatListItemLine, MatListItem)).toBeFalsy();
    });
  });
});
