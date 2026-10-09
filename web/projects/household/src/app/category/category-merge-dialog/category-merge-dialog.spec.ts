import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CategoryMergeDialog, CategoryMergeDialogData } from './category-merge-dialog';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { elementSelectorFactory, IElementSelector, MockSignalStore, provideMockSignalStore } from '@household/shared-ui';
import { CategoryStore } from '@household/state/category/category-store';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { createMockService, MockService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { MatActionList, MatListItem } from '@angular/material/list';
import { MatChip, MatChipSet } from '@angular/material/chips';
import { CategoryType } from '@household/shared/enums';
import { Responses } from '@household/shared/types/responses';

describe('CategoryMergeDialog', () => {
  let fixture: ComponentFixture<CategoryMergeDialog>;
  let selector: IElementSelector;
  let mockCategoryStore: MockSignalStore<typeof CategoryStore>;
  let mockDialogRef: MockService<MatDialogRef<CategoryMergeDialog>>;

  const targetCategory: CategoryMergeDialogData = testDataFactory.category.response({
    categoryType: CategoryType.Regular,
  });
  const sourceCategory1 = testDataFactory.category.response({
    categoryType: CategoryType.Regular,
  });
  const sourceCategory2 = testDataFactory.category.response({
    categoryType: CategoryType.Regular,
  });

  const getListItems = () => {
    return selector.listComponents<MatListItem, HTMLButtonElement>(MatListItem, MatActionList);
  };

  const getChips = () => {
    return selector.listComponents<MatChip, HTMLElement>(MatChip, MatChipSet);
  };

  const getSaveButton = () => {
    return selector.getElementByTestId<HTMLButtonElement>('save-button', MatDialogActions);
  };

  const render = async (params?: {
    dialogData?: CategoryMergeDialogData;
    categoryList?: Responses.Category[];
  }) => {
    TestBed.resetTestingModule();

    mockDialogRef = createMockService('close');

    await TestBed.configureTestingModule({
      imports: [CategoryMergeDialog],
      providers: [
        provideMockSignalStore(CategoryStore, 'categoryList'),
        {
          provide: MAT_DIALOG_DATA,
          useValue: params?.dialogData ?? targetCategory,
        },
        {
          provide: MatDialogRef,
          useValue: mockDialogRef.service,
        },
      ],
    })
      .compileComponents();

    mockCategoryStore = TestBed.inject<MockSignalStore<typeof CategoryStore>>(CategoryStore);
    mockCategoryStore.categoryList.set(params?.categoryList ?? [
      targetCategory,
      sourceCategory1,
      sourceCategory2,
    ]);

    fixture = TestBed.createComponent(CategoryMergeDialog);

    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  };

  describe('dialog title', () => {
    it('should display the name of the merge target category', async () => {
      await render();

      expect(selector.getComponent(MatDialogTitle).nativeElement.textContent).toContain(targetCategory.name);
    });
  });

  describe('selectable category list', () => {
    it('should display every category of the same type that are not children or the target itself', async () => {
      await render();

      const listItems = getListItems();

      expect(listItems.length).toBe(2);
      expect(listItems[0].nativeElement.textContent.trim()).toBe(sourceCategory1.name);
      expect(listItems[1].nativeElement.textContent.trim()).toBe(sourceCategory2.name);
    });

    describe('should display nothing', () => {
      it('if the source target is a different type', async () => {
        const invoiceCategory = testDataFactory.category.response({
          categoryType: CategoryType.Invoice,
        });    

        await render({
          categoryList: [
            targetCategory,
            invoiceCategory,
          ],
        });
        
        expect(getListItems().length).toBe(0);
      });

      it('if the source target is a child of target', async () => {
        const invoiceCategory = testDataFactory.category.response({
          categoryType: CategoryType.Regular,
          ancestors: [targetCategory],
        });
        
        await render({
          categoryList: [
            targetCategory,
            invoiceCategory,
          ],
        });
        
        expect(getListItems().length).toBe(0);
      });

      it('if the merge target is the only category', async () => {      
        await render({
          categoryList: [targetCategory],
        });
        
        expect(getListItems().length).toBe(0);
      });
    });

    describe('on click', () => {
      it('should select the category and remove it from the list', async () => {
        await render();

        getListItems()[0].nativeElement.click();

        await fixture.whenStable();

        const listItems = getListItems();
        expect(listItems.length).toBe(1);
        expect(listItems[0].nativeElement.textContent.trim()).toBe(sourceCategory2.name);
        expect(fixture.componentInstance.selectedCategories()).toEqual([sourceCategory1]);
      });
    });
  });

  describe('selected category chips', () => {
    it('should not be rendered by default', async () => {
      await render();

      expect(getChips().length).toBe(0);
    });

    it('should be rendered for each selected category', async () => {
      await render();

      getListItems()[0].nativeElement.click();
      await fixture.whenStable();

      getListItems()[0].nativeElement.click();
      await fixture.whenStable();

      const chips = getChips();
      expect(chips.length).toBe(2);
      expect(chips[0].nativeElement.textContent).toContain(sourceCategory1.name);
      expect(chips[1].nativeElement.textContent).toContain(sourceCategory2.name);
    });

    describe('on click', () => {
      it('should deselect the category and put it back to the list', async () => {
        await render();

        getListItems()[0].nativeElement.click();
        await fixture.whenStable();

        getChips()[0].nativeElement.click();
        await fixture.whenStable();

        expect(getChips().length).toBe(0);
        expect(getListItems().length).toBe(2);
        expect(fixture.componentInstance.selectedCategories()).toEqual([]);
      });
    });
  });

  describe('save button', () => {
    it('should be disabled if no category is selected', async () => {
      await render();

      expect(getSaveButton().nativeElement.disabled).toBe(true);
    });

    it('should be enabled if a category is selected', async () => {
      await render();

      getListItems()[0].nativeElement.click();

      await fixture.whenStable();

      expect(getSaveButton().nativeElement.disabled).toBe(false);
    });

    it('should close the dialog with the selected categories if clicked', async () => {
      await render();

      getListItems()[0].nativeElement.click();
      await fixture.whenStable();

      getListItems()[0].nativeElement.click();
      await fixture.whenStable();

      getSaveButton().nativeElement.click();

      validateFunctionCall(mockDialogRef.functions.close, {
        sourceCategoryIds: [
          sourceCategory1.categoryId,
          sourceCategory2.categoryId,
        ],
        targetCategoryId: targetCategory.categoryId,
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
