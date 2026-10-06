import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecipientMergeDialog, RecipientMergeDialogData } from './recipient-merge-dialog';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { elementSelectorFactory, IElementSelector, MockSignalStore, provideMockSignalStore } from '@household/shared-ui';
import { RecipientStore } from '@household/state/recipient/recipient-store';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { createMockService, MockService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { MatActionList, MatListItem } from '@angular/material/list';
import { MatChip, MatChipSet } from '@angular/material/chips';

describe('RecipientMergeDialog', () => {
  let fixture: ComponentFixture<RecipientMergeDialog>;
  let selector: IElementSelector;
  let mockRecipientStore: MockSignalStore<typeof RecipientStore>;
  let mockDialogRef: MockService<MatDialogRef<RecipientMergeDialog>>;

  const targetRecipient: RecipientMergeDialogData = testDataFactory.recipient.response();
  const sourceRecipient1 = testDataFactory.recipient.response();
  const sourceRecipient2 = testDataFactory.recipient.response();

  const getListItems = () => {
    return selector.listComponents<MatListItem, HTMLButtonElement>(MatListItem, MatActionList);
  };

  const getChips = () => {
    return selector.listComponents<MatChip, HTMLElement>(MatChip, MatChipSet);
  };

  const getSaveButton = () => {
    return selector.getElementByTestId<HTMLButtonElement>('save-button', MatDialogActions);
  };

  const render = async () => {
    fixture = TestBed.createComponent(RecipientMergeDialog);

    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  };

  beforeEach(async () => {
    mockDialogRef = createMockService('close');

    await TestBed.configureTestingModule({
      imports: [RecipientMergeDialog],
      providers: [
        provideMockSignalStore(RecipientStore, 'recipientList'),
        {
          provide: MAT_DIALOG_DATA,
          useValue: targetRecipient,
        },
        {
          provide: MatDialogRef,
          useValue: mockDialogRef.service,
        },
      ],
    })
      .compileComponents();

    mockRecipientStore = TestBed.inject<MockSignalStore<typeof RecipientStore>>(RecipientStore);
    mockRecipientStore.recipientList.set([
      targetRecipient,
      sourceRecipient1,
      sourceRecipient2,
    ]);
  });

  describe('dialog title', () => {
    it('should display the name of the merge target recipient', async () => {
      await render();

      expect(selector.getComponent(MatDialogTitle).nativeElement.textContent).toContain(targetRecipient.name);
    });
  });

  describe('selectable recipient list', () => {
    it('should display every recipient except the merge target', async () => {
      await render();

      const listItems = getListItems();

      expect(listItems.length).toBe(2);
      expect(listItems[0].nativeElement.textContent.trim()).toBe(sourceRecipient1.name);
      expect(listItems[1].nativeElement.textContent.trim()).toBe(sourceRecipient2.name);
    });

    it('should display nothing if the merge target is the only recipient', async () => {
      mockRecipientStore.recipientList.set([targetRecipient]);

      await render();

      expect(getListItems().length).toBe(0);
    });

    describe('on click', () => {
      it('should select the recipient and remove it from the list', async () => {
        await render();

        getListItems()[0].nativeElement.click();

        await fixture.whenStable();

        const listItems = getListItems();
        expect(listItems.length).toBe(1);
        expect(listItems[0].nativeElement.textContent.trim()).toBe(sourceRecipient2.name);
        expect(fixture.componentInstance.selectedRecipients()).toEqual([sourceRecipient1]);
      });
    });
  });

  describe('selected recipient chips', () => {
    it('should not be rendered by default', async () => {
      await render();

      expect(getChips().length).toBe(0);
    });

    it('should be rendered for each selected recipient', async () => {
      await render();

      getListItems()[0].nativeElement.click();
      await fixture.whenStable();

      getListItems()[0].nativeElement.click();
      await fixture.whenStable();

      const chips = getChips();
      expect(chips.length).toBe(2);
      expect(chips[0].nativeElement.textContent).toContain(sourceRecipient1.name);
      expect(chips[1].nativeElement.textContent).toContain(sourceRecipient2.name);
    });

    describe('on click', () => {
      it('should deselect the recipient and put it back to the list', async () => {
        await render();

        getListItems()[0].nativeElement.click();
        await fixture.whenStable();

        getChips()[0].nativeElement.click();
        await fixture.whenStable();

        expect(getChips().length).toBe(0);
        expect(getListItems().length).toBe(2);
        expect(fixture.componentInstance.selectedRecipients()).toEqual([]);
      });
    });
  });

  describe('save button', () => {
    it('should be disabled if no recipient is selected', async () => {
      await render();

      expect(getSaveButton().nativeElement.disabled).toBe(true);
    });

    it('should be enabled if a recipient is selected', async () => {
      await render();

      getListItems()[0].nativeElement.click();

      await fixture.whenStable();

      expect(getSaveButton().nativeElement.disabled).toBe(false);
    });

    it('should close the dialog with the selected recipients if clicked', async () => {
      await render();

      getListItems()[0].nativeElement.click();
      await fixture.whenStable();

      getListItems()[0].nativeElement.click();
      await fixture.whenStable();

      getSaveButton().nativeElement.click();

      validateFunctionCall(mockDialogRef.functions.close, {
        sourceRecipientIds: [
          sourceRecipient1.recipientId,
          sourceRecipient2.recipientId,
        ],
        targetRecipientId: targetRecipient.recipientId,
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
