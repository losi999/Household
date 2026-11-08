import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductSelectDialog, ProductSelectDialogData } from './product-select-dialog';
import { ClearableInput, createStubComponent, elementSelectorFactory, IElementSelector, MockSignalStore, provideMockSignalStore } from '@household/shared-ui';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { createMockService, MockService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { ProductStore } from '@household/state/product/product-store';
import { MatListItem, MatActionList, MatListItemTitle } from '@angular/material/list';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { Responses } from '@household/shared/types/responses';
import { toSearchable } from '@household/shared/common/utils';
import { PRODUCT_FULL_NAME_SEPARATOR } from '@household/shared/constants';

describe('ProductSelectDialog', () => {
  const ClearableInputStub = createStubComponent(ClearableInput);

  let fixture: ComponentFixture<ProductSelectDialog>;
  let selector: IElementSelector;
  let mockDialogRef: MockService<MatDialogRef<ProductSelectDialog>>;
  let mockProductStore: MockSignalStore<typeof ProductStore>;

  const genericWithSpecifics = testDataFactory.product.response.generic();
  const specificWithVariant = testDataFactory.product.response.specific({
    genericProduct: genericWithSpecifics,
  });
  const variant = testDataFactory.product.response.variant({
    specificProduct: specificWithVariant,
  });
  const specificWithoutChildren = testDataFactory.product.response.specific({
    genericProduct: genericWithSpecifics,
  });
  const genericWithoutChildren = testDataFactory.product.response.generic();

  // every product is followed by its children, as the store holds them
  const productList = [
    genericWithSpecifics,
    specificWithVariant,
    variant,
    specificWithoutChildren,
    genericWithoutChildren,
  ];

  const getSearchInput = () => {
    return selector.getComponent(ClearableInputStub, MatDialogContent);
  };

  const getListItems = () => {
    return selector.listComponents<MatListItem, HTMLButtonElement>(MatListItem, MatActionList);
  };

  const getListTitles = () => {
    return getListItems().map(item => selector.getComponent(MatListItemTitle, item).nativeElement.textContent.trim());
  };

  const render = async (params?: {
    dialogData?: ProductSelectDialogData;
    productList?: Responses.Product[];
  }) => {
    TestBed.resetTestingModule();

    mockDialogRef = createMockService('close');

    await TestBed.configureTestingModule({
      imports: [ProductSelectDialog],
      providers: [
        provideMockSignalStore(ProductStore, 'productList'),
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
      .overrideComponent(ProductSelectDialog, {
        remove: {
          imports: [ClearableInput],
        },
        add: {
          imports: [ClearableInputStub],
        },
      })
      .compileComponents();

    mockProductStore = TestBed.inject<MockSignalStore<typeof ProductStore>>(ProductStore);
    mockProductStore.productList.set(params?.productList ?? productList);

    fixture = TestBed.createComponent(ProductSelectDialog);

    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  };

  describe('dialog title', () => {
    it('should be rendered', async () => {
      await render();

      expect(selector.getComponent(MatDialogTitle).nativeElement.textContent).toContain('Termék');
    });
  });

  describe('search input', () => {
    it('should be rendered', async () => {
      await render();

      expect(getSearchInput()).toBeTruthy();
    });
  });

  describe('selectable product list', () => {
    it('should display the products from the store', async () => {
      await render();

      expect(getListTitles()).toEqual([
        genericWithSpecifics.name,
        specificWithVariant.name,
        variant.name,
        specificWithoutChildren.name,
        genericWithoutChildren.name,
      ]);
    });

    it('should display the products from injected data', async () => {
      await render({
        dialogData: productList,
        productList: [],
      });

      expect(getListTitles()).toEqual([
        genericWithSpecifics.name,
        specificWithVariant.name,
        variant.name,
        specificWithoutChildren.name,
        genericWithoutChildren.name,
      ]);    
    });

    it('should display data in secondary lines', async () => {
      await render({
        dialogData: [specificWithVariant],
      });

      expect(selector.getComponentByTestId('measurement').nativeElement.textContent).toEqual(`${specificWithVariant.measurement} ${specificWithVariant.unitOfMeasurement}`);
      expect(selector.getComponentByTestId('full-name').nativeElement.textContent).toEqual(specificWithVariant.fullName);
    });

    describe('search', () => {
      it('should filter the products by their full name', async () => {
        const generic = testDataFactory.product.response.generic({
          name: 'search',
        });
        const specific = testDataFactory.product.response.specific({
          genericProduct: generic,
        });
        const variant = testDataFactory.product.response.variant({
          specificProduct: specific,
        });
        await render({
          productList: [
            ...productList,
            toSearchable(generic, ['name']),
            toSearchable(specific, ['fullName'], PRODUCT_FULL_NAME_SEPARATOR),
            toSearchable(variant, ['fullName'], PRODUCT_FULL_NAME_SEPARATOR),
          ],
        });

        getSearchInput().componentInstance.value.set('search');
        await fixture.whenStable();

        expect(getListTitles()).toEqual([
          generic.name,
          specific.name,
          variant.name,
        ]);
      });
    });

    describe('on click', () => {
      it('should close the dialog with the generic product', async () => {
        await render();

        getListItems()[0].nativeElement.click();

        validateFunctionCall(mockDialogRef.functions.close, genericWithSpecifics);
      });

      it('should close the dialog with the specific product', async () => {
        await render();

        getListItems()[1].nativeElement.click();

        validateFunctionCall(mockDialogRef.functions.close, specificWithVariant);
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
