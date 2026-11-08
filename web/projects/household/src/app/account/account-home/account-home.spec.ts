import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccountHome } from './account-home';
import { createStubComponent, elementSelectorFactory, IElementSelector, MockSignalStore, provideMockDispatcher, provideMockSignalStore } from '@household/shared-ui';
import { Toolbar } from '@household/app/shared/toolbar/toolbar';
import { AccountList } from '@household/app/account/account-list/account-list';
import { AccountStore } from '@household/state/account/account-store';
import { accountApiEvents, accountEvents } from '@household/state/account/account-events';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { validateFunctionCall } from '@household/shared/common/unit-testing';
import { Dispatcher } from '@ngrx/signals/events';
import { Responses } from '@household/shared/types/responses';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';

describe('AccountHome', () => {
  const ToolbarStub = createStubComponent(Toolbar);
  const AccountListStub = createStubComponent(AccountList);

  let fixture: ComponentFixture<AccountHome>;
  let selector: IElementSelector;
  let mockAccountStore: MockSignalStore<typeof AccountStore>;
  let mockDispatcher: Dispatcher;

  const accounts = [
    testDataFactory.account.response(),
    testDataFactory.account.response(),
  ];

  const render = async (accountList: Responses.Account[] = accounts) => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [AccountHome],
      providers: [
        provideMockSignalStore(AccountStore, 'accountList'),
        provideMockDispatcher(),
      ],
    })
      .overrideComponent(AccountHome, {
        remove: {
          imports: [
            Toolbar,
            AccountList,
          ],
        },
        add: {
          imports: [
            ToolbarStub,
            AccountListStub,
          ],
        },
      })
      .compileComponents();

    mockAccountStore = TestBed.inject<MockSignalStore<typeof AccountStore>>(AccountStore);
    mockDispatcher = TestBed.inject(Dispatcher);

    mockAccountStore.accountList.set(accountList);

    fixture = TestBed.createComponent(AccountHome);

    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  };

  describe('on init', () => {
    it('should dispatch listAccountsInitiated', async () => {
      await render();

      validateFunctionCall(mockDispatcher.dispatch, accountApiEvents.listAccountsInitiated(), {
        scope: 'self',
      });
    });
  });

  describe('toolbar', () => {
    it('should be rendered with the title', async () => {
      await render();

      expect(selector.getComponent<Toolbar>(ToolbarStub).componentInstance.title()).toBe('Számlák');
    });
  });

  describe('create button', () => {
    const getElement = () => {
      return selector.getComponent<MatIconButton, HTMLButtonElement>(MatIconButton, ToolbarStub);
    };

    it('should be rendered', async () => {
      await render();

      expect(selector.getComponent(MatIcon, ToolbarStub).nativeElement.textContent).toBe('add');
    });

    it('should dispatch createAccount if clicked', async () => {
      await render();

      getElement().nativeElement.click();

      validateFunctionCall(mockDispatcher.dispatch, accountEvents.createAccount(), {
        scope: 'self',
      });
    });
  });

  describe('account list', () => {
    it('should be rendered with the accounts of the store', async () => {
      await render();

      expect(selector.getComponent<AccountList>(AccountListStub).componentInstance.accounts()).toEqual(accounts);
    });

    it('should be rendered with an empty list', async () => {
      await render([]);

      expect(selector.getComponent<AccountList>(AccountListStub).componentInstance.accounts()).toEqual([]);
    });
  });
});
