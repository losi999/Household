import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductDialog, ProductDialogData } from './product-dialog';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { ClearableInput, createStubComponent, elementSelectorFactory, IconText, IElementSelector, MockSignalStore, provideMockDispatcher, provideMockSignalStore } from '@household/shared-ui';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { createMockService, MockService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { ProductStore } from '@household/state/product/product-store';
import { productEvents } from '@household/state/product/product-events';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatSelect } from '@angular/material/select';
import { Dispatcher } from '@ngrx/signals/events';
import { unitsOfMeasurement } from '@household/shared/constants';
import { ProductType } from '@household/shared/enums';
import { Responses } from '@household/shared/types/responses';

describe('ProductDialog', () => {
  const ClearableInputStub = createStubComponent(ClearableInput);
  const IconTextStub = createStubComponent(IconText);

  let fixture: ComponentFixture<ProductDialog>;
  let selector: IElementSelector;
  let mockProductStore: MockSignalStore<typeof ProductStore>;
  let mockDialogRef: MockService<MatDialogRef<ProductDialog>>;
  let mockDispatcher: Dispatcher;

  const genericWithChildren = testDataFactory.product.response.generic();
  const specificWithChildren = testDataFactory.product.response.specific({
    genericProduct: genericWithChildren,
  });
  const variant = testDataFactory.product.response.variant({
    specificProduct: specificWithChildren,
  });
  const specificWithoutChildren = testDataFactory.product.response.specific({
    genericProduct: genericWithChildren,
  });
  
  const genericWithoutChildren = testDataFactory.product.response.generic();
  const productList = [
    genericWithoutChildren,
    genericWithChildren,
    specificWithChildren,
    variant,
    specificWithoutChildren,
  ];

  const getNameInput = () => {
    return selector.getComponentByTestId<ClearableInput>('name', MatDialogContent);
  };

  const getMeasurementInput = () => {
    return selector.getComponentByTestId<ClearableInput>('measurement', MatDialogContent);
  };

  const getUnitSelect = () => {
    return selector.getComponentByTestId<MatSelect>('unit-of-measurement', MatDialogContent);
  };

  const getParentIconText = () => {
    return selector.getComponent(IconTextStub, MatDialogContent);
  };

  const getParentMenuButton = () => {
    return selector.getComponent(MatIconButton, MatDialogContent);
  };

  const getParentEditButton = () => {
    return selector.getComponentByTestId<MatButton>('edit-parent-button');
  };

  const getParentRemoveButton = () => {
    return selector.getComponentByTestId<MatButton>('remove-parent-button');
  };

  const getParentAddButton = () => {
    return selector.getComponentByTestId<MatButton>('add-parent-button', MatDialogContent);
  };

  const getSaveButton = () => {
    return selector.getElementByTestId<HTMLButtonElement>('save-button', MatDialogActions);
  };

  const setValue = async (input: ClearableInput, value: string | number) => {
    input.value.set(value);

    await fixture.whenStable();
  };

  const selectParent = async (parent: Responses.Product) => {
    mockProductStore.pendingParentProduct.set(parent);

    await fixture.whenStable();
  };

  const openParentMenu = async () => {
    getParentMenuButton().nativeElement.click();

    await fixture.whenStable();
  };

  const render = async (params?: {
    dialogData?: ProductDialogData;
    productList?: Responses.Product[];
  }) => {
    TestBed.resetTestingModule();

    mockDialogRef = createMockService('close');

    await TestBed.configureTestingModule({
      imports: [ProductDialog],
      providers: [
        provideMockSignalStore(ProductStore, 'productList', 'pendingParentProduct'),
        provideMockDispatcher(),
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
      .overrideComponent(ProductDialog, {
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

    mockProductStore = TestBed.inject<MockSignalStore<typeof ProductStore>>(ProductStore);
    mockDispatcher = TestBed.inject(Dispatcher);

    mockProductStore.productList.set(params?.productList ?? productList);

    fixture = TestBed.createComponent(ProductDialog);

    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  };

  describe('dialog title', () => {
    it('should be the create title if no product is given', async () => {
      await render();

      expect(selector.getComponent(MatDialogTitle).nativeElement.textContent).toBe('Új termék');
    });

    it('should be the edit title if a product is given', async () => {
      await render({
        dialogData: genericWithoutChildren,
      });

      expect(selector.getComponent(MatDialogTitle).nativeElement.textContent).toBe('Termék szerkesztése');
    });
  });

  describe('name input', () => {
    it('should be empty if no product is given', async () => {
      await render();

      expect(getNameInput().componentInstance.label()).toBe('Név');
      expect(getNameInput().componentInstance.value()).toBe('');
    });

    it('should be filled with the name of the product', async () => {
      await render({
        dialogData: genericWithoutChildren,
      });

      expect(getNameInput().componentInstance.value()).toBe(genericWithoutChildren.name);
    });

    it('should be required', async () => {
      await render();

      expect(getNameInput().componentInstance.errors().map(error => error.message)).toEqual(['Kötelező']);
    });
  });

  describe('parent product', () => {
    it('should not be rendered for a new product', async () => {
      await render();

      expect(getParentIconText()).toBeFalsy();
      expect(getParentMenuButton()).toBeFalsy();
      expect(getParentAddButton()).toBeTruthy();
    });

    it('should not be rendered for a generic product', async () => {
      await render({
        dialogData: genericWithoutChildren,
      });

      expect(getParentIconText()).toBeFalsy();
      expect(getParentAddButton()).toBeTruthy();
    });

    it('should be the generic product of a specific product', async () => {
      await render({
        dialogData: specificWithoutChildren,
      });

      expect(getParentIconText().componentInstance.text()).toBe(genericWithChildren.fullName);
      expect(getParentIconText().componentInstance.icon()).toBe('account_tree');
      expect(getParentMenuButton()).toBeTruthy();
      expect(getParentAddButton()).toBeFalsy();
    });

    it('should be the specific product of a variant product, with its full name', async () => {
      await render({
        dialogData: variant,
      });

      expect(getParentIconText().componentInstance.text()).toBe(specificWithChildren.fullName);
      expect(getParentMenuButton()).toBeTruthy();
    });

    it('should not be offered for a generic product with children', async () => {
      await render({
        dialogData: genericWithChildren,
      });

      expect(getParentIconText()).toBeFalsy();
      expect(getParentMenuButton()).toBeFalsy();
      expect(getParentAddButton()).toBeFalsy();
    });

    it('should be the product selected in the select dialog', async () => {
      await render();

      await selectParent(genericWithoutChildren);

      expect(getParentIconText().componentInstance.text()).toBe(genericWithoutChildren.fullName);
      expect(fixture.componentInstance.parentProduct()).toEqual(genericWithoutChildren);
    });
  });

  describe('remove parent product button', () => {
    it('should remove the parent product from the form', async () => {
      await render({
        dialogData: variant,
      });

      await openParentMenu();

      getParentRemoveButton().nativeElement.click();
      await fixture.whenStable();

      expect(fixture.componentInstance.parentProduct()).toBeUndefined();
      expect(getParentAddButton()).toBeTruthy();
    });

    it('should be available for a specific product without children', async () => {
      await render({
        dialogData: specificWithoutChildren,
      });

      await openParentMenu();

      expect(getParentRemoveButton()).toBeTruthy();
    });

    it('should not be available for a specific product with children', async () => {
      await render({
        dialogData: specificWithChildren,
      });

      await openParentMenu();

      expect(getParentEditButton()).toBeTruthy();
      expect(getParentRemoveButton()).toBeFalsy();
    });
  });

  describe('edit parent product button', () => {
    it('should dispatch selectProduct with the updated product', async () => {
      await render({
        dialogData: specificWithoutChildren,
      });

      await openParentMenu();

      getParentEditButton().nativeElement.click();
      await fixture.whenStable();

      validateFunctionCall(mockDispatcher.dispatch, productEvents.selectProduct([
        genericWithoutChildren,
        genericWithChildren,
        specificWithChildren,
      ]), {
        scope: 'self',
      });
    });
  });

  describe('add parent product button', () => {
    it('should dispatch selectProduct without a product to update when creating', async () => {
      await render();

      getParentAddButton().nativeElement.click();
      await fixture.whenStable();

      validateFunctionCall(mockDispatcher.dispatch, productEvents.selectProduct([
        genericWithoutChildren,
        genericWithChildren,
        specificWithChildren,
        specificWithoutChildren,
      ]), {
        scope: 'self',
      });
    });

    it('should dispatch selectProduct with the valid product for a generic without children', async () => {
      await render({
        dialogData: genericWithoutChildren,
      });

      getParentAddButton().nativeElement.click();
      await fixture.whenStable();

      validateFunctionCall(mockDispatcher.dispatch, productEvents.selectProduct([
        genericWithChildren,
        specificWithChildren,
        specificWithoutChildren,
      ]), {
        scope: 'self',
      });
    });
  });

  describe('measurement input', () => {
    it('should not be rendered if there is no parent product', async () => {
      await render();

      expect(getMeasurementInput()).toBeFalsy();
    });

    it('should not be rendered if the parent product is a specific product', async () => {
      await render({
        dialogData: variant,
      });

      expect(getMeasurementInput()).toBeFalsy();
    });

    it('should be rendered if the parent product is a generic product', async () => {
      await render();

      await selectParent(genericWithChildren);

      expect(getMeasurementInput().componentInstance.label()).toBe('Mennyiség');
      expect(getMeasurementInput().componentInstance.type()).toBe('number');
    });

    it('should be filled with the measurement of the updated specific product', async () => {
      await render({
        dialogData: specificWithoutChildren,
      });

      expect(getMeasurementInput().componentInstance.value()).toBe(specificWithoutChildren.measurement);
    });

    it('should accept a positive number only', async () => {
      await render();
      await selectParent(genericWithChildren);

      await setValue(getMeasurementInput().componentInstance, 0);
      expect(getMeasurementInput().componentInstance.errors().map(error => error.message)).toEqual(['A mennyiségnek nagyobbnak kell lennie, mint 0']);

      await setValue(getMeasurementInput().componentInstance, -3);
      expect(getMeasurementInput().componentInstance.errors().map(error => error.message)).toEqual(['A mennyiségnek nagyobbnak kell lennie, mint 0']);

      await setValue(getMeasurementInput().componentInstance, 2.5);
      expect(getMeasurementInput().componentInstance.errors()).toEqual([]);
    });

    it('should be required', async () => {
      await render();
      await selectParent(genericWithChildren);

      await setValue(getMeasurementInput().componentInstance, '');

      expect(getMeasurementInput().componentInstance.errors().map(error => error.message)).toContain('Kötelező');
    });
  });

  describe('unit of measurement select', () => {
    it('should not be rendered if there is no parent product', async () => {
      await render();

      expect(getUnitSelect()).toBeFalsy();
    });

    it('should not be rendered if the parent product is a specific product', async () => {
      await render({
        dialogData: variant,
      });

      expect(getUnitSelect()).toBeFalsy();
    });

    it('should be rendered with the default value if the parent product is a generic product', async () => {
      await render();

      await selectParent(genericWithChildren);

      expect(getUnitSelect().componentInstance.value).toBe('db');
    });

    it('should be set to the unit of the updated specific product', async () => {
      await render({
        dialogData: specificWithoutChildren,
      });

      expect(getUnitSelect().componentInstance.value).toBe(specificWithoutChildren.unitOfMeasurement);
    });

    it('should offer the accepted units of measurement', async () => {
      await render();
      await selectParent(genericWithChildren);

      getUnitSelect().componentInstance.open();
      await fixture.whenStable();

      const options = Array.from(document.querySelectorAll('mat-option')).map(option => option.textContent.trim());

      expect(options).toEqual([...unitsOfMeasurement]);
    });
  });

  describe('save button', () => {
    it('should be disabled if the form is invalid', async () => {
      await render();

      expect(getSaveButton().nativeElement.disabled).toBe(true);
    });

    it('should be disabled if the parent product is generic and the measurement is not positive', async () => {
      await render();
      await selectParent(genericWithChildren);
      await setValue(getNameInput().componentInstance, 'product name');

      expect(getSaveButton().nativeElement.disabled).toBe(true);
    });

    it('should not close the dialog if the name is empty', async () => {
      await render();

      getSaveButton().nativeElement.click();
      await fixture.whenStable();

      validateFunctionCall(mockDialogRef.functions.close);
    });

    it('should not close the dialog if the parent product is generic and the measurement is not positive', async () => {
      await render();
      await selectParent(genericWithChildren);
      await setValue(getNameInput().componentInstance, 'product name');

      getSaveButton().nativeElement.click();
      await fixture.whenStable();

      validateFunctionCall(mockDialogRef.functions.close);
    });

    it('should close the dialog with a generic product if there is no parent product', async () => {
      await render();
      await setValue(getNameInput().componentInstance, 'product name');

      getSaveButton().nativeElement.click();

      validateFunctionCall(mockDialogRef.functions.close, {
        productType: ProductType.Generic,
        name: 'product name',
      });
    });

    it('should close the dialog with a specific product if the parent product is generic', async () => {
      await render();
      await selectParent(genericWithChildren);
      await setValue(getNameInput().componentInstance, 'product name');
      await setValue(getMeasurementInput().componentInstance, 750);
      fixture.componentInstance.productForm.unitOfMeasurement().value.set('g');
      await fixture.whenStable();

      getSaveButton().nativeElement.click();

      validateFunctionCall(mockDialogRef.functions.close, {
        productType: ProductType.Specific,
        name: 'product name',
        parentProductId: genericWithChildren.productId,
        measurement: 750,
        unitOfMeasurement: 'g',
      });
    });

    it('should close the dialog with a variant product if the parent product is specific', async () => {
      await render();
      await selectParent(specificWithoutChildren);
      await setValue(getNameInput().componentInstance, 'product name');

      getSaveButton().nativeElement.click();

      validateFunctionCall(mockDialogRef.functions.close, {
        productType: ProductType.Variant,
        name: 'product name',
        parentProductId: specificWithoutChildren.productId,
      });
    });

    describe('when updating', () => {
      it('should close the dialog with the values of the unchanged specific product', async () => {
        await render({
          dialogData: specificWithoutChildren,
        });

        getSaveButton().nativeElement.click();

        validateFunctionCall(mockDialogRef.functions.close, {
          productType: ProductType.Specific,
          name: specificWithoutChildren.name,
          parentProductId: genericWithChildren.productId,
          measurement: specificWithoutChildren.measurement,
          unitOfMeasurement: specificWithoutChildren.unitOfMeasurement,
        });
      });

      it('should close the dialog with a generic product if the parent product is removed from a variant product', async () => {
        await render({
          dialogData: variant,
        });

        await openParentMenu();
        getParentRemoveButton().nativeElement.click();
        await fixture.whenStable();

        getSaveButton().nativeElement.click();

        validateFunctionCall(mockDialogRef.functions.close, {
          productType: ProductType.Generic,
          name: variant.name,
        });
      });

      it('should close the dialog with a specific product if a generic parent is selected for a variant product', async () => {
        await render({
          dialogData: variant,
        });
        await selectParent(genericWithoutChildren);
        await setValue(getMeasurementInput().componentInstance, 3);

        getSaveButton().nativeElement.click();

        validateFunctionCall(mockDialogRef.functions.close, {
          productType: ProductType.Specific,
          name: variant.name,
          parentProductId: genericWithoutChildren.productId,
          measurement: 3,
          unitOfMeasurement: 'db',
        });
      });

      it('should close the dialog with a variant product if a specific parent is selected for a specific product without children', async () => {
        await render({
          dialogData: specificWithoutChildren,
        });
        await selectParent(specificWithChildren);

        getSaveButton().nativeElement.click();

        validateFunctionCall(mockDialogRef.functions.close, {
          productType: ProductType.Variant,
          name: specificWithoutChildren.name,
          parentProductId: specificWithChildren.productId,
        });
      });

      it('should close the dialog with a generic product with the new name if a generic product with children is renamed', async () => {
        await render({
          dialogData: genericWithChildren,
        });
        await setValue(getNameInput().componentInstance, 'renamed');

        getSaveButton().nativeElement.click();

        validateFunctionCall(mockDialogRef.functions.close, {
          productType: ProductType.Generic,
          name: 'renamed',
        });
      });
    });
  });

  describe('cancel button', () => {
    it('should be rendered', async () => {
      await render();

      expect(selector.getElementByCss('[mat-dialog-close]', MatDialogActions)).toBeTruthy();
    });
  });
});
