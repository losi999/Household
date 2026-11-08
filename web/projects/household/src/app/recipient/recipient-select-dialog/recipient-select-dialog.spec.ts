import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecipientSelectDialog, RecipientSelectDialogData } from './recipient-select-dialog';
import { ClearableInput, createStubComponent, elementSelectorFactory, IElementSelector, MockSignalStore, provideMockSignalStore } from '@household/shared-ui';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { createMockService, MockService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { RecipientStore } from '@household/state/recipient/recipient-store';
import { MatListItem, MatActionList } from '@angular/material/list';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { Responses } from '@household/shared/types/responses';
import { Searchable } from '@household/shared/types/common';
import { toSearchable } from '@household/shared/common/utils';

describe('RecipientSelectDialog', () => {
  const ClearableInputStub = createStubComponent(ClearableInput);

  let fixture: ComponentFixture<RecipientSelectDialog>;
  let selector: IElementSelector;
  let mockDialogRef: MockService<MatDialogRef<RecipientSelectDialog>>;
  let mockRecipientStore: MockSignalStore<typeof RecipientStore>;

  const recipient1 = toSearchable(testDataFactory.recipient.response({
    name: 'Közért',
  }), ['name']);
  const recipient2 = toSearchable(testDataFactory.recipient.response({
    name: 'Pékség',
  }), ['name']);

  const getSearchInput = () => {
    return selector.getComponent(ClearableInputStub, MatDialogContent);
  };

  const getListItems = () => {
    return selector.listComponents<MatListItem, HTMLButtonElement>(MatListItem, MatActionList);
  };

  const render = async (params?: {
    dialogData?: RecipientSelectDialogData;
    recipientList?: Searchable<Responses.Recipient>[];
  }) => {
    TestBed.resetTestingModule();

    mockDialogRef = createMockService('close');
    
    await TestBed.configureTestingModule({
      imports: [RecipientSelectDialog],
      providers: [
        provideMockSignalStore(RecipientStore, 'recipientList'),
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
      .overrideComponent(RecipientSelectDialog, {
        remove: {
          imports: [ClearableInput],
        },
        add: {
          imports: [ClearableInputStub],
        },
      })
      .compileComponents();

    mockRecipientStore = TestBed.inject<MockSignalStore<typeof RecipientStore>>(RecipientStore);
    mockRecipientStore.recipientList.set(params?.recipientList ?? [
      recipient1,
      recipient2,
    ]);

    fixture = TestBed.createComponent(RecipientSelectDialog);
      
    selector = elementSelectorFactory(fixture.debugElement);
      
    await fixture.whenStable();
  };

  describe('dialog title', () => {
    it('should be rendered', async () => {
      await render();

      expect(selector.getComponent(MatDialogTitle).nativeElement.textContent).toContain('Partner');
    });
  });

  describe('search input', () => {
    it('should be rendered', async () => {
      await render();

      expect(getSearchInput()).toBeTruthy();
    });
  });

  describe('selectable recipient list', () => {
    it('should display the recipients from the store', async () => {
      await render();

      const listItems = getListItems();

      expect(listItems.length).toBe(2);
      expect(listItems[0].nativeElement.textContent.trim()).toBe(recipient1.name);
      expect(listItems[1].nativeElement.textContent.trim()).toBe(recipient2.name);
    });

    it('should display the recipients from injected data', async () => {
      await render({
        dialogData: [recipient2],
        recipientList: [
          recipient1,
          recipient2,
        ],
      });

      const listItems = getListItems();

      expect(listItems.length).toBe(1);
      expect(listItems[0].nativeElement.textContent.trim()).toBe(recipient2.name);
    });

    it('should be filtered based on search input value', async () => {
      await render(); 
 
      getSearchInput().componentInstance.value.set('köz');

      await fixture.whenStable();

      const listItems = getListItems();
  
      expect(listItems.length).toBe(1);
      expect(listItems[0].nativeElement.textContent.trim()).toBe(recipient1.name);
    });
  
    describe('on click', () => {
      it('should close the dialog with the selected recipient', async () => {
        await render();
  
        getListItems()[0].nativeElement.click();
  
        await fixture.whenStable();

        validateFunctionCall(mockDialogRef.functions.close, recipient1);
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
