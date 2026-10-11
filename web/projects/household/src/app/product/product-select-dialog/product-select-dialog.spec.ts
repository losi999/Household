import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductSelectDialog, ProductSelectDialogData } from './product-select-dialog';
import { ClearableInput, createStubComponent, elementSelectorFactory, IElementSelector, MockSignalStore, provideMockSignalStore } from '@household/shared-ui';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { createMockService, MockService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { ProductStore } from '@household/state/product/product-store';
import { MatListItem, MatActionList, MatListItemLine, MatListItemTitle } from '@angular/material/list';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { Responses } from '@household/shared/types/responses';

describe('ProductSelectDialog', () => {
  const ClearableInputStub = createStubComponent(ClearableInput);

  let fixture: ComponentFixture<ProductSelectDialog>;
  let selector: IElementSelector;
  let mockDialogRef: MockService<MatDialogRef<ProductSelectDialog>>;
  let mockProductStore: MockSignalStore<typeof ProductStore>;

  const genericWithSpecifics = testDataFactory.product.response.generic({
    name: 'generic with specifics',
    fullName: 'generic with specifics',
  });
  const specificWithVariant = testDataFactory.product.response.specific({
    name: 'specific with variant',
    fullName: 'generic with specifics / specific with variant 1 kg',
    genericProductId: genericWithSpecifics.productId,
  });
  const variant = testDataFactory.product.response.variant({
    name: 'variant',
    fullName: 'generic with specifics / specific with variant 1 kg / variant',
    genericProductId: genericWithSpecifics.productId,
    specificProductId: specificWithVariant.productId,
  });
  const specificWithoutChildren = testDataFactory.product.response.specific({
    name: 'specific without children',
    fullName: 'generic with specifics / specific without children 5 g',
    genericProductId: genericWithSpecifics.productId,
  });
  const genericWithoutChildren = testDataFactory.product.response.generic({
    name: 'generic without children',
    fullName: 'generic without children',
  });

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

  const getListTexts = () => {
    return getListItems().map(item => selector.getComponent(MatListItemTitle, item).nativeElement.textContent.trim());
  };

  const getListLines = () => {
    return getListItems().map(item => selector.getComponent(MatListItemLine, item)?.nativeElement.textContent.trim());
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
    describe('by default', () => {
      it('should display the full name of every product in the order of the store, variant products too', async () => {
        await render();

        expect(getListTexts()).toEqual([
          genericWithSpecifics.name,
          specificWithVariant.name,
          variant.name,
          specificWithoutChildren.name,
          genericWithoutChildren.name,
        ]);
      });

      it('should display the name of the product with its full name below it, except for generic products', async () => {
        await render();

        expect(getListLines()).toEqual([
          undefined,
          'generic with specifics / specific with variant 1 kg',
          'generic with specifics / specific with variant 1 kg / variant',
          'generic with specifics / specific without children 5 g',
          undefined,
        ]);
      });

      it('should not apply the rules of the parents to the product to update', async () => {
        await render({
          dialogData: {
            productToUpdate: genericWithSpecifics,
          },
        });

        expect(getListTexts().length).toBe(productList.length);
      });

      it('should display nothing if there are no products', async () => {
        await render({
          productList: [],
        });

        expect(getListItems().length).toBe(0);
      });
    });

    describe('when selecting the parent of a new product', () => {
      it('should display every generic and specific product', async () => {
        await render({
          dialogData: {
            isParentSelection: true,
          },
        });

        expect(getListTexts()).toEqual([
          genericWithSpecifics.name,
          specificWithVariant.name,
          specificWithoutChildren.name,
          genericWithoutChildren.name,
        ]);
      });

      it('should never display variant products, because they cannot have children', async () => {
        await render({
          dialogData: {
            isParentSelection: true,
          },
        });

        expect(getListTexts()).not.toContain(variant.name);
      });
    });

    describe('when selecting the parent of an updated product', () => {
      it('should not display the product itself', async () => {
        await render({
          dialogData: {
            isParentSelection: true,
            productToUpdate: genericWithoutChildren,
          },
        });

        expect(getListTexts()).toEqual([
          genericWithSpecifics.name,
          specificWithVariant.name,
          specificWithoutChildren.name,
        ]);
      });

      it('should display every other generic and specific product for a variant product', async () => {
        await render({
          dialogData: {
            isParentSelection: true,
            productToUpdate: variant,
          },
        });

        expect(getListTexts()).toEqual([
          genericWithSpecifics.name,
          specificWithVariant.name,
          specificWithoutChildren.name,
          genericWithoutChildren.name,
        ]);
      });

      it('should display every other generic and specific product for a specific product without children', async () => {
        await render({
          dialogData: {
            isParentSelection: true,
            productToUpdate: specificWithoutChildren,
          },
        });

        expect(getListTexts()).toEqual([
          genericWithSpecifics.name,
          specificWithVariant.name,
          genericWithoutChildren.name,
        ]);
      });

      it('should display every other generic and specific product for a generic product without children', async () => {
        await render({
          dialogData: {
            isParentSelection: true,
            productToUpdate: genericWithoutChildren,
          },
        });

        expect(getListTexts()).toContain(specificWithoutChildren.name);
      });

      it('should display only generic products for a specific product with children', async () => {
        await render({
          dialogData: {
            isParentSelection: true,
            productToUpdate: specificWithVariant,
          },
        });

        expect(getListTexts()).toEqual([
          genericWithSpecifics.name,
          genericWithoutChildren.name,
        ]);
      });

      it('should display nothing for a generic product with children, because it would become a different type', async () => {
        await render({
          dialogData: {
            isParentSelection: true,
            productToUpdate: genericWithSpecifics,
          },
        });

        expect(getListItems().length).toBe(0);
      });
    });

    describe('search', () => {
      it('should filter the products by their full name', async () => {
        await render();

        getSearchInput().componentInstance.value.set('without');
        await fixture.whenStable();

        expect(getListTexts()).toEqual([
          specificWithoutChildren.name,
          genericWithoutChildren.name,
        ]);
      });

      it('should find the children of a product by the name of the product', async () => {
        await render();

        getSearchInput().componentInstance.value.set('specifics');
        await fixture.whenStable();

        expect(getListTexts()).toEqual([
          genericWithSpecifics.name,
          specificWithVariant.name,
          variant.name,
          specificWithoutChildren.name,
        ]);
      });

      it('should ignore accents', async () => {
        const accented = testDataFactory.product.response.generic({
          name: 'ékezetes termék',
          fullName: 'ékezetes termék',
        });

        await render({
          productList: [
            accented,
            genericWithoutChildren,
          ],
        });

        getSearchInput().componentInstance.value.set('ekezetes');
        await fixture.whenStable();

        expect(getListTexts()).toEqual([accented.name]);
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
