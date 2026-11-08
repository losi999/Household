import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CategoryDialog, CategoryDialogData } from './category-dialog';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { ClearableInput, createStubComponent, elementSelectorFactory, IElementSelector, MockSignalStore, provideMockSignalStore } from '@household/shared-ui';
import { CategorySelector } from '@household/app/category/category-selector/category-selector';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { createMockService, MockService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { CategoryStore } from '@household/state/category/category-store';
import { MatButtonToggle } from '@angular/material/button-toggle';
import { CategoryType } from '@household/shared/enums';
import { Responses } from '@household/shared/types/responses';
import { Searchable } from '@household/shared/types/common';

describe('CategoryDialog', () => {
  const ClearableInputStub = createStubComponent(ClearableInput);
  const CategorySelectorStub = createStubComponent(CategorySelector);

  let fixture: ComponentFixture<CategoryDialog>;
  let selector: IElementSelector;
  let mockDialogRef: MockService<MatDialogRef<CategoryDialog>>;
  let mockCategoryStore: MockSignalStore<typeof CategoryStore>;

  const category = testDataFactory.category.response();

  const getNameInput = () => {
    return selector.getComponentByTestId<ClearableInput>('name', MatDialogContent);
  };

  const getRegularCategoryButton = () => {
    return selector.getComponentByTestId<MatButtonToggle>('category-type-regular', MatDialogContent);
  };

  const getInventoryCategoryButton = () => {
    return selector.getComponentByTestId<MatButtonToggle>('category-type-inventory', MatDialogContent);
  };

  const getInvoiceCategoryButton = () => {
    return selector.getComponentByTestId<MatButtonToggle>('category-type-invoice', MatDialogContent);
  };

  const getParentSelector = () => {
    return selector.getComponent(CategorySelectorStub, MatDialogContent);
  };

  const setValue = async (input: ClearableInput, value: string) => {
    input.value.set(value);

    await fixture.whenStable();
  };

  const getSaveButton = () => {
    return selector.getElementByTestId<HTMLButtonElement>('save-button', MatDialogActions);
  };

  const render = async (params?: {
    dialogData?: CategoryDialogData;
    categoryList?: Searchable<Responses.Category>[];
  }) => {
    TestBed.resetTestingModule();

    mockDialogRef = createMockService('close');

    await TestBed.configureTestingModule({
      imports: [CategoryDialog],
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
      .overrideComponent(CategoryDialog, {
        remove: {
          imports: [
            ClearableInput,
            CategorySelector,
          ],
        },
        add: {
          imports: [
            ClearableInputStub,
            CategorySelectorStub,
          ],
        },
      })
      .compileComponents();

    mockCategoryStore = TestBed.inject<MockSignalStore<typeof CategoryStore>>(CategoryStore);

    mockCategoryStore.categoryList.set(params?.categoryList ?? []);

    fixture = TestBed.createComponent(CategoryDialog);

    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  };

  describe('dialog title', () => {
    it('should be the create title if no category is given', async () => {
      await render();

      expect(selector.getComponent(MatDialogTitle).nativeElement.textContent).toBe('Új kategória');
    });

    it('should be the edit title if a category is given', async () => {
      await render({
        dialogData: category,
      });

      expect(selector.getComponent(MatDialogTitle).nativeElement.textContent).toBe('Kategória szerkesztése');
    });
  });

  describe('name input', () => {
    it('should be empty if no category is given', async () => {
      await render();

      expect(getNameInput().componentInstance.label()).toBe('Név');
      expect(getNameInput().componentInstance.value()).toBe('');
    });

    it('should be filled with the name of the category', async () => {
      await render({
        dialogData: category,
      });

      expect(getNameInput().componentInstance.value()).toBe(category.name);
    });

    it('should be required', async () => {
      await render();

      expect(getNameInput().componentInstance.errors().map(error => error.message)).toEqual(['Kötelező']);
    });
  });

  describe('category type selector', () => {
    it('should be set to the default value if no category is given', async () => {
      await render();

      expect(getRegularCategoryButton().componentInstance.checked).toBe(true);
    });

    describe('on click', () => {
      it('should set the category type to regular', async () => {
        await render();

        getRegularCategoryButton().nativeElement.querySelector('button').click();

        await fixture.whenStable();

        expect(getRegularCategoryButton().componentInstance.checked).toBe(true);
        expect(fixture.componentInstance.categoryForm.categoryType().value()).toBe(CategoryType.Regular);
      });

      it('should set the category type to inventory', async () => {
        await render();

        getInventoryCategoryButton().nativeElement.querySelector('button').click();

        await fixture.whenStable();

        expect(getInventoryCategoryButton().componentInstance.checked).toBe(true);
        expect(fixture.componentInstance.categoryForm.categoryType().value()).toBe(CategoryType.Inventory);
      });

      it('should set the category type to invoice', async () => {
        await render();

        getInvoiceCategoryButton().nativeElement.querySelector('button').click();

        await fixture.whenStable();

        expect(getInvoiceCategoryButton().componentInstance.checked).toBe(true);
        expect(fixture.componentInstance.categoryForm.categoryType().value()).toBe(CategoryType.Invoice);
      });
    });
  });

  describe('parent category selector', () => {
    it('should be rendered with the parent category of the category as its value', async () => {
      const parentCategory = testDataFactory.category.response();
      const category = testDataFactory.category.response({
        parentCategory,
      });

      await render({
        dialogData: category,
      });

      expect(getParentSelector().componentInstance.label()).toBe('Szülő');
      expect(getParentSelector().componentInstance.value()).toEqual(parentCategory);
    });

    it('should be rendered empty if no parent category is given', async () => {
      await render();

      expect(getParentSelector().componentInstance.value()).toBeNull();
    });

    it('should not be required', async () => {
      await render();

      expect(getParentSelector().componentInstance.required()).toBe(false);
    });

    it('should offer every category when creating', async () => {
      const category1 = testDataFactory.category.response();
      const category2 = testDataFactory.category.response();

      await render({
        categoryList: [
          category1,
          category2,
        ],
      });

      expect(getParentSelector().componentInstance.items()).toEqual([
        category1,
        category2,
      ]);
    });

    it('should offer every category but the edited one and its children', async () => {
      const parentCategory = testDataFactory.category.response();
      const category = testDataFactory.category.response({
        parentCategory,
      });
      const childCategory = testDataFactory.category.response({
        ancestors: [category],
      });
      const otherCategory = testDataFactory.category.response();

      await render({
        dialogData: category,
        categoryList: [
          parentCategory,
          category,
          childCategory,
          otherCategory,
        ],
      });

      expect(getParentSelector().componentInstance.items()).toEqual([
        parentCategory,
        otherCategory,
      ]);
    });

    it('should set the parent category of the form when one is selected', async () => {
      await render();
      const parentCategory = testDataFactory.category.response();

      getParentSelector().componentInstance.value.set(parentCategory);
      await fixture.whenStable();

      expect(fixture.componentInstance.categoryForm.parentCategory().value()).toEqual(parentCategory);
    });
  });

  describe('save button', () => {
    it('should be disabled if form is invalid', async () => {
      await render();

      expect(getSaveButton().nativeElement.disabled).toBe(true);
    });

    it('should not close the dialog if the name is empty', async () => {
      await render();

      getSaveButton().nativeElement.click();

      await fixture.whenStable();

      validateFunctionCall(mockDialogRef.functions.close);
    });

    it('should close the dialog with the entered values', async () => {
      await render();

      const parentCategory = testDataFactory.category.response();

      await setValue(getNameInput().componentInstance, 'category name');
      getInventoryCategoryButton().nativeElement.querySelector('button').click();
      getParentSelector().componentInstance.value.set(parentCategory);
      await fixture.whenStable();

      getSaveButton().nativeElement.click();
 
      validateFunctionCall(mockDialogRef.functions.close, {
        name: 'category name',
        categoryType: CategoryType.Inventory,
        parentCategoryId: parentCategory.categoryId,
      });
    });

    it('should close the dialog with an undefined parent category Id if it is empty', async () => {
      await render();

      await setValue(getNameInput().componentInstance, 'category name');
      getInventoryCategoryButton().nativeElement.querySelector('button').click();

      getSaveButton().nativeElement.click();

      validateFunctionCall(mockDialogRef.functions.close, {
        name: 'category name',
        categoryType: CategoryType.Inventory,
        parentCategoryId: undefined,
      });
    });

    it('should close the dialog with the values of the edited category', async () => {
      await render({
        dialogData: category,
      });

      getSaveButton().nativeElement.click();

      validateFunctionCall(mockDialogRef.functions.close, {
        name: category.name,
        categoryType: category.categoryType,
        parentCategoryId: undefined,
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
