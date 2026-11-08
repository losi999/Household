import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccountSelectDialog, AccountSelectDialogData } from './account-select-dialog';
import { ClearableInput, createStubComponent, elementSelectorFactory, IElementSelector, MockSignalStore, provideMockSignalStore } from '@household/shared-ui';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { createMockService, MockService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { AccountStore } from '@household/state/account/account-store';
import { MatListItem, MatActionList } from '@angular/material/list';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { Responses } from '@household/shared/types/responses';
import { Searchable } from '@household/shared/types/common';
import { toSearchable } from '@household/shared/common/utils';

describe('AccountSelectDialog', () => {
  const ClearableInputStub = createStubComponent(ClearableInput);

  let fixture: ComponentFixture<AccountSelectDialog>;
  let selector: IElementSelector;
  let mockDialogRef: MockService<MatDialogRef<AccountSelectDialog>>;
  let mockAccountStore: MockSignalStore<typeof AccountStore>;

  const account1 = toSearchable(testDataFactory.account.response({
    name: 'Megtakarítás',
  }), ['name']);
  const account2 = toSearchable(testDataFactory.account.response({
    name: 'Bankszámla',
  }), ['name']);

  const getSearchInput = () => {
    return selector.getComponent(ClearableInputStub, MatDialogContent);
  };

  const getListItems = () => {
    return selector.listComponents<MatListItem, HTMLButtonElement>(MatListItem, MatActionList);
  };

  const render = async (params?: {
    dialogData?: AccountSelectDialogData;
    accountList?: Searchable<Responses.Account>[];
  }) => {
    TestBed.resetTestingModule();

    mockDialogRef = createMockService('close');
    
    await TestBed.configureTestingModule({
      imports: [AccountSelectDialog],
      providers: [
        provideMockSignalStore(AccountStore, 'accountList'),
        {
          provide: MAT_DIALOG_DATA,
          useValue: params?.dialogData,
        },
        {
          provide: MatDialogRef,
          useValue: mockDialogRef.service,
        },
      ],
    })
      .overrideComponent(AccountSelectDialog, {
        remove: {
          imports: [ClearableInput],
        },
        add: {
          imports: [ClearableInputStub],
        },
      })
      .compileComponents();

    mockAccountStore = TestBed.inject<MockSignalStore<typeof AccountStore>>(AccountStore);
    mockAccountStore.accountList.set(params?.accountList ?? [
      account1,
      account2,
    ]);

    fixture = TestBed.createComponent(AccountSelectDialog);
      
    selector = elementSelectorFactory(fixture.debugElement);
      
    await fixture.whenStable();
  };

  describe('dialog title', () => {
    it('should be rendered', async () => {
      await render();

      expect(selector.getComponent(MatDialogTitle).nativeElement.textContent).toContain('Számla');
    });
  });

  describe('search input', () => {
    it('should be rendered', async () => {
      await render();

      expect(getSearchInput()).toBeTruthy();
    });
  });

  describe('selectable account list', () => {
    it('should display the accounts from the store', async () => {
      await render();

      const listItems = getListItems();

      expect(listItems.length).toBe(2);
      expect(listItems[0].nativeElement.textContent.trim()).toBe(account1.name);
      expect(listItems[1].nativeElement.textContent.trim()).toBe(account2.name);
    });

    it('should display the accounts from injected data', async () => {
      await render({
        dialogData: [account2],
        accountList: [
          account1,
          account2,
        ],
      });

      const listItems = getListItems();

      expect(listItems.length).toBe(1);
      expect(listItems[0].nativeElement.textContent.trim()).toBe(account2.name);
    });

    it('should be filtered based on search input value', async () => {
      await render(); 
 
      getSearchInput().componentInstance.value.set('megtak');

      await fixture.whenStable();

      const listItems = getListItems();
  
      expect(listItems.length).toBe(1);
      expect(listItems[0].nativeElement.textContent.trim()).toBe(account1.name);
    });
  
    describe('on click', () => {
      it('should close the dialog with the selected account', async () => {
        await render();
  
        getListItems()[0].nativeElement.click();
  
        await fixture.whenStable();

        validateFunctionCall(mockDialogRef.functions.close, account1);
      });
    });
  });

  describe('cancel button', () => {
    it('should be rendered', async () => {
      await render();

      expect(selector.getComponent(MatDialogClose, MatDialogActions)).toBeTruthy();
    });
  });
});
