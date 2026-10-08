import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CategoryDialog, CategoryDialogData } from './category-dialog';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { ClearableInput, createStubComponent, elementSelectorFactory, IconText, IElementSelector, provideMockDispatcher, provideMockSignalStore } from '@household/shared-ui';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { createMockService, MockService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { CategoryStore } from '@household/state/category/category-store';
import { MatButtonToggle } from '@angular/material/button-toggle';
import { CategoryType } from '@household/shared/enums';
import { MatButton, MatIconButton } from '@angular/material/button';
import { Dispatcher } from '@ngrx/signals/events';
import { categoryEvents } from '@household/state/category/category-events';

describe('CategoryDialog', () => {
  const ClearableInputStub = createStubComponent(ClearableInput);
  const IconTextStub = createStubComponent(IconText);

  let fixture: ComponentFixture<CategoryDialog>;
  let selector: IElementSelector;
  let mockDialogRef: MockService<MatDialogRef<CategoryDialog>>;
  let mockDispatcher: Dispatcher;

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

  const getParentCategoryIconText = () => {
    return selector.getComponent(IconTextStub, MatDialogContent);
  };

  const getParentCategoryMenuButton = () => {
    return selector.getComponent(MatIconButton, MatDialogContent);
  };

  const getParentCategoryEditButton = () => {
    return selector.getComponentByTestId<MatButton>('edit-parent-button');
  };

  const getParentCategoryRemoveButton = () => {
    return selector.getComponentByTestId<MatButton>('remove-parent-button');
  };

  const getParentCategoryAddButton = () => {
    return selector.getComponentByTestId<MatButton>('add-parent-button', MatDialogContent);
  };

  const setValue = async (input: ClearableInput, value: string) => {
    input.value.set(value);

    await fixture.whenStable();
  };

  const getSaveButton = () => {
    return selector.getElementByTestId<HTMLButtonElement>('save-button', MatDialogActions);
  };

  const render = async (dialogData: CategoryDialogData = undefined) => {
    TestBed.resetTestingModule();

    mockDialogRef = createMockService('close');

    await TestBed.configureTestingModule({
      imports: [CategoryDialog],
      providers: [
        provideMockSignalStore(CategoryStore, 'pendingParentCategory'),
        provideMockDispatcher(),
        {
          provide: MAT_DIALOG_DATA,
          useValue: dialogData,
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
            IconText,
          ],
        },
        add: {
          imports: [
            ClearableInputStub,
            IconTextStub,
          ],
        },
      })
      .compileComponents();

    mockDispatcher = TestBed.inject(Dispatcher);

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
      await render(category);

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
      await render(category);

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

  describe('parent category', () => {
    it('should be rendered if a parent category is given', async () => {
      const parentCategory = testDataFactory.category.response();
      const category = testDataFactory.category.response({
        parentCategory,
      });

      await render(category);

      expect(getParentCategoryIconText().componentInstance.text()).toBe(parentCategory.fullName);
      expect(getParentCategoryIconText().componentInstance.icon()).toBe('account_tree');
      expect(getParentCategoryMenuButton()).toBeTruthy();  
      expect(getParentCategoryAddButton()).toBeFalsy();        
    });

    it('should not be rendered if no parent category is given', async () => {
      await render();

      expect(getParentCategoryIconText()).toBeFalsy();
      expect(getParentCategoryMenuButton()).toBeFalsy();  
      expect(getParentCategoryAddButton()).toBeTruthy();    
    });
  });

  describe('remove parent category button', () => {
    it('should remove the parent category from the form', async () => {
      const parentCategory = testDataFactory.category.response();
      const category = testDataFactory.category.response({
        parentCategory,
      });

      await render(category);

      getParentCategoryMenuButton().nativeElement.click();

      await fixture.whenStable();

      getParentCategoryRemoveButton().nativeElement.click();

      await fixture.whenStable();

      expect(fixture.componentInstance.parentCategory()).toBeUndefined();
    });
  });

  describe('edit parent category button', () => {
    it('should dispatch selectCategory', async () => {
      const parentCategory = testDataFactory.category.response();
      const category = testDataFactory.category.response({
        parentCategory,
      });

      await render(category);

      getParentCategoryMenuButton().nativeElement.click();

      await fixture.whenStable();

      getParentCategoryEditButton().nativeElement.click();

      await fixture.whenStable();

      validateFunctionCall(mockDispatcher.dispatch, categoryEvents.selectCategory({
        selectedCategory: category,
        exclude: {
          self: true,
          children: true,
        },
      }), {
        scope: 'self',
      });
    });
  });

  describe('add parent category button', () => {
    it('should dispatch selectCategory', async () => {
      await render();

      getParentCategoryAddButton().nativeElement.click();

      await fixture.whenStable();

      validateFunctionCall(mockDispatcher.dispatch, categoryEvents.selectCategory({
        selectedCategory: undefined,
        exclude: {
          self: true,
          children: true,
        },
      }), {
        scope: 'self',
      });
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
      fixture.componentInstance.parentCategory.set(parentCategory);

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
      await render(category);

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
