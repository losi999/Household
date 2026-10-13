import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccountList } from './account-list';
import { createStubComponent, elementSelectorFactory, IElementSelector } from '@household/shared-ui';
import { AccountListItem } from '@household/app/account/account-list-item/account-list-item';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { MatActionList } from '@angular/material/list';
import { Responses } from '@household/shared/types/responses';

describe('AccountList', () => {
  const AccountListItemStub = createStubComponent(AccountListItem);

  let fixture: ComponentFixture<AccountList>;
  let selector: IElementSelector;

  const accounts = [
    testDataFactory.account.response(),
    testDataFactory.account.response(),
  ];

  const render = async (accountList: Responses.Account[] = accounts) => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [AccountList],
    })
      .overrideComponent(AccountList, {
        remove: {
          imports: [AccountListItem],
        },
        add: {
          imports: [AccountListItemStub],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(AccountList);
    fixture.componentRef.setInput('accounts', accountList);

    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  };

  describe('list', () => {
    it('should be rendered', async () => {
      await render();

      expect(selector.getComponent(MatActionList)).toBeTruthy();
    });
  });

  describe('list items', () => {
    it('should be rendered for each account in the given order', async () => {
      await render();

      const listItems = selector.listComponents<AccountListItem>(AccountListItemStub, MatActionList);

      expect(listItems.length).toBe(accounts.length);
      listItems.forEach((listItem, index) => {
        expect(listItem.componentInstance.account()).toEqual(accounts[index]);
      });
    });

    it('should not be rendered if there are no accounts', async () => {
      await render([]);

      expect(selector.listComponents(AccountListItemStub, MatActionList).length).toBe(0);
    });
  });
});
