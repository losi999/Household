import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductSelectDialog, ProductSelectDialogData } from './product-select-dialog';
import { ClearableInput, createStubComponent, elementSelectorFactory, IElementSelector, MockSignalStore, provideMockSignalStore } from '@household/shared-ui';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { createMockService, MockService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { ProductStore } from '@household/state/product/product-store';
import { MatListItem, MatActionList } from '@angular/material/list';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { Responses } from '@household/shared/types/responses';

describe('ProductSelectDialog', () => {
  const ClearableInputStub = createStubComponent(ClearableInput);

  let fixture: ComponentFixture<ProductSelectDialog>;
  let selector: IElementSelector;
  let mockDialogRef: MockService<MatDialogRef<ProductSelectDialog>>;
  let mockProductStore: MockSignalStore<typeof ProductStore>;

  const variant = testDataFactory.product.treeItem.variant({
    name: 'variant',
  });
  const specificWithVariant = testDataFactory.product.treeItem.specific({
    name: 'specific with variant',
    fullName: 'specific with variant 1 kg',
    children: [variant],
  });
  const specificWithoutChildren = testDataFactory.product.treeItem.specific({
    name: 'specific without children',
    fullName: 'specific without children 5 g',
  });
  const genericWithSpecifics = testDataFactory.product.tree({
    name: 'generic with specifics',
    children: [
      specificWithVariant,
      specificWithoutChildren,
    ],
  });
  const genericWithoutChildren = testDataFactory.product.tree({
    name: 'generic without children',
  });
  const productList = [
    genericWithSpecifics,
    genericWithoutChildren,
  ];

  const getSearchInput = () => {
    return selector.getComponent(ClearableInputStub, MatDialogContent);
  };

  const getListItems = () => {
    return selector.listComponents<MatListItem, HTMLButtonElement>(MatListItem, MatActionList);
  };

  const getListTexts = () => {
    return getListItems().map(item => item.nativeElement.textContent.trim());
  };

  const render = async (params?: {
    dialogData?: ProductSelectDialogData;
    productList?: Responses.ProductTree[];
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
    describe('when creating a product', () => {
      it('should display every generic and specific product, each generic product followed by its specific products', async () => {
        await render();

        expect(getListTexts()).toEqual([
          genericWithSpecifics.name,
          specificWithVariant.fullName,
          specificWithoutChildren.fullName,
          genericWithoutChildren.name,
        ]);
      });

      it('should never display variant products, because they cannot have children', async () => {
        await render();

        expect(getListTexts()).not.toContain(variant.name);
      });

      it('should display nothing if there are no products', async () => {
        await render({
          productList: [],
        });

        expect(getListItems().length).toBe(0);
      });
    });

    describe('when updating a product', () => {
      it('should not display the product itself', async () => {
        await render({
          dialogData: {
            productToUpdate: genericWithoutChildren,
          },
        });

        expect(getListTexts()).toEqual([
          genericWithSpecifics.name,
          specificWithVariant.fullName,
          specificWithoutChildren.fullName,
        ]);
      });

      it('should display every other generic and specific product for a variant product', async () => {
        await render({
          dialogData: {
            productToUpdate: variant,
          },
        });

        expect(getListTexts()).toEqual([
          genericWithSpecifics.name,
          specificWithVariant.fullName,
          specificWithoutChildren.fullName,
          genericWithoutChildren.name,
        ]);
      });

      it('should display every other generic and specific product for a specific product without children', async () => {
        await render({
          dialogData: {
            productToUpdate: specificWithoutChildren,
          },
        });

        expect(getListTexts()).toEqual([
          genericWithSpecifics.name,
          specificWithVariant.fullName,
          genericWithoutChildren.name,
        ]);
      });

      it('should display every other generic and specific product for a generic product without children', async () => {
        await render({
          dialogData: {
            productToUpdate: genericWithoutChildren,
          },
        });

        expect(getListTexts()).toContain(specificWithoutChildren.fullName);
      });

      it('should display only generic products for a specific product with children', async () => {
        await render({
          dialogData: {
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
            productToUpdate: genericWithSpecifics,
          },
        });

        expect(getListItems().length).toBe(0);
      });
    });

    describe('search', () => {
      it('should filter the products by their displayed name', async () => {
        await render();

        getSearchInput().componentInstance.value.set('without');
        await fixture.whenStable();

        expect(getListTexts()).toEqual([
          specificWithoutChildren.fullName,
          genericWithoutChildren.name,
        ]);
      });

      it('should ignore accents', async () => {
        const accented = testDataFactory.product.tree({
          name: 'ékezetes termék',
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
