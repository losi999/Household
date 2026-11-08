import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CategorySelectDialog, CategorySelectDialogData } from './category-select-dialog';
import { ClearableInput, createStubComponent, elementSelectorFactory, IElementSelector, MockSignalStore, provideMockSignalStore } from '@household/shared-ui';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { createMockService, MockService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { CategoryStore } from '@household/state/category/category-store';
import { MatListItem, MatActionList } from '@angular/material/list';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { Responses } from '@household/shared/types/responses';
import { Searchable } from '@household/shared/types/common';
import { toSearchable } from '@household/shared/common/utils';
import { CATEGORY_FULL_NAME_SEPARATOR } from '@household/shared/constants';

describe('CategorySelectDialog', () => {
  const ClearableInputStub = createStubComponent(ClearableInput);

  let fixture: ComponentFixture<CategorySelectDialog>;
  let selector: IElementSelector;
  let mockDialogRef: MockService<MatDialogRef<CategorySelectDialog>>;
  let mockCategoryStore: MockSignalStore<typeof CategoryStore>;

  const category1 = toSearchable(testDataFactory.category.response(), ['fullName'], CATEGORY_FULL_NAME_SEPARATOR);
  const category2 = toSearchable(testDataFactory.category.response(), ['fullName'], CATEGORY_FULL_NAME_SEPARATOR);

  const getSearchInput = () => {
    return selector.getComponent(ClearableInputStub, MatDialogContent);
  };

  const getListItems = () => {
    return selector.listComponents<MatListItem, HTMLButtonElement>(MatListItem, MatActionList);
  };

  const render = async (params?: {
    dialogData?: CategorySelectDialogData;
    categoryList?: Searchable<Responses.Category>[];
  }) => {
    TestBed.resetTestingModule();

    mockDialogRef = createMockService('close');
    
    await TestBed.configureTestingModule({
      imports: [CategorySelectDialog],
      providers: [
        provideMockSignalStore(CategoryStore, 'categoryList'),
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
      .overrideComponent(CategorySelectDialog, {
        remove: {
          imports: [ClearableInput],
        },
        add: {
          imports: [ClearableInputStub],
        },
      })
      .compileComponents();

    mockCategoryStore = TestBed.inject<MockSignalStore<typeof CategoryStore>>(CategoryStore);
    mockCategoryStore.categoryList.set(params?.categoryList ?? [
      category1,
      category2,
    ]);

    fixture = TestBed.createComponent(CategorySelectDialog);
      
    selector = elementSelectorFactory(fixture.debugElement);
      
    await fixture.whenStable();
  };

  describe('dialog title', () => {
    it('should be rendered', async () => {
      await render();

      expect(selector.getComponent(MatDialogTitle).nativeElement.textContent).toContain('Kategória');
    });
  });

  describe('search input', () => {
    it('should be rendered', async () => {
      await render();

      expect(getSearchInput()).toBeTruthy();
    });
  });

  describe('selectable category list', () => {
    it('should display the categories from the store', async () => {
      await render();

      const listItems = getListItems();

      expect(listItems.length).toBe(2);
      expect(listItems[0].nativeElement.textContent.trim()).toBe(category1.name);
      expect(listItems[1].nativeElement.textContent.trim()).toBe(category2.name);
    });

    it('should display the categories from injected data', async () => {
      await render({
        dialogData: [category2],
        categoryList: [
          category1,
          category2,
        ],
      });

      const listItems = getListItems();

      expect(listItems.length).toBe(1);
      expect(listItems[0].nativeElement.textContent.trim()).toBe(category2.name);
    });

    it('should be filtered based on search input value', async () => {
      await render(); 
 
      getSearchInput().componentInstance.value.set(category1.name.split(' ')[0]);

      await fixture.whenStable();

      const listItems = getListItems();
  
      expect(listItems.length).toBe(1);
      expect(listItems[0].nativeElement.textContent.trim()).toBe(category1.name);
    });
  
    describe('on click', () => {
      it('should close the dialog with the selected category', async () => {
        await render();
  
        getListItems()[0].nativeElement.click();
  
        await fixture.whenStable();

        validateFunctionCall(mockDialogRef.functions.close, category1);
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
