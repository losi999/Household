import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductMergeDialog, ProductMergeDialogData } from './product-merge-dialog';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { elementSelectorFactory, IElementSelector, MockSignalStore, provideMockSignalStore } from '@household/shared-ui';
import { ProductStore } from '@household/state/product/product-store';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { createMockService, MockService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { MatActionList, MatListItem, MatListItemLine, MatListItemTitle } from '@angular/material/list';
import { MatChip, MatChipSet } from '@angular/material/chips';
import { Responses } from '@household/shared/types/responses';

describe('ProductMergeDialog', () => {
  let fixture: ComponentFixture<ProductMergeDialog>;
  let selector: IElementSelector;
  let mockProductStore: MockSignalStore<typeof ProductStore>;
  let mockDialogRef: MockService<MatDialogRef<ProductMergeDialog>>;

  const targetGeneric = testDataFactory.product.response.generic();
  const sourceGeneric1 = testDataFactory.product.response.generic();
  const sourceGeneric2 = testDataFactory.product.response.generic();
  const anotherGeneric = testDataFactory.product.response.generic();

  const targetSpecific = testDataFactory.product.response.specific({
    genericProduct: sourceGeneric1,
  });
  const sourceSpecific1 = testDataFactory.product.response.specific({
    genericProduct: sourceGeneric1,
  });
  const sourceSpecific2 = testDataFactory.product.response.specific({
    genericProduct: sourceGeneric1,
  });
  const otherSpecific = testDataFactory.product.response.specific({
    genericProduct: anotherGeneric,
  });

  const targetVariant = testDataFactory.product.response.variant({
    specificProduct: targetSpecific,
  });
  const sourceVariant1 = testDataFactory.product.response.variant({
    specificProduct: targetSpecific,
  });
  const sourceVariant2 = testDataFactory.product.response.variant({
    specificProduct: targetSpecific,
  });
  const otherVariant = testDataFactory.product.response.variant({
    specificProduct: otherSpecific,
  });

  // the products of every level in a single flat list
  const allProducts = [
    targetGeneric,
    sourceGeneric1,
    targetSpecific,
    sourceSpecific1,
    sourceSpecific2,
    targetVariant,
    sourceVariant1,
    sourceVariant2,
    sourceGeneric2,
    anotherGeneric,
    otherSpecific,
    otherVariant,
  ];

  const getListItems = () => {
    return selector.listComponents<MatListItem, HTMLButtonElement>(MatListItem, MatActionList);
  };

  const getListItemTitles = () => {
    return selector.listComponents(MatListItemTitle, MatListItem, MatActionList).map(item => item.nativeElement.textContent);
  };

  const getListItemLines = () => {
    return selector.listComponents(MatListItemLine, MatListItem, MatActionList).map(item => item.nativeElement.textContent);
  };

  const getChips = () => {
    return selector.listComponents<MatChip, HTMLElement>(MatChip, MatChipSet);
  };

  const getSaveButton = () => {
    return selector.getElementByTestId<HTMLButtonElement>('save-button', MatDialogActions);
  };

  const render = async (params?: {
    dialogData?: ProductMergeDialogData;
    productList?: Responses.Product[];
  }) => {
    TestBed.resetTestingModule();

    mockDialogRef = createMockService('close');

    await TestBed.configureTestingModule({
      imports: [ProductMergeDialog],
      providers: [
        provideMockSignalStore(ProductStore, 'productList'),
        {
          provide: MAT_DIALOG_DATA,
          useValue: params?.dialogData ?? targetGeneric,
        },
        {
          provide: MatDialogRef,
          useValue: mockDialogRef.service,
        },
      ],
    })
      .compileComponents();

    mockProductStore = TestBed.inject<MockSignalStore<typeof ProductStore>>(ProductStore);
    mockProductStore.productList.set(params?.productList ?? [
      targetGeneric,
      sourceGeneric1,
      sourceGeneric2,
    ]);

    fixture = TestBed.createComponent(ProductMergeDialog);

    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  };

  describe('dialog title', () => {
    it('should display the full name of a generic product', async () => {
      await render();

      expect(selector.getComponent(MatDialogTitle).nativeElement.textContent).toContain(targetGeneric.fullName);
    });

    it('should display the full name of a specific product', async () => {
      await render({
        dialogData: targetSpecific,
        productList: allProducts,
      });

      expect(selector.getComponent(MatDialogTitle).nativeElement.textContent).toContain(targetSpecific.fullName);
    });

    it('should display the full name of a variant product', async () => {
      await render({
        dialogData: targetVariant,
        productList: allProducts,
      });

      expect(selector.getComponent(MatDialogTitle).nativeElement.textContent).toContain(targetVariant.fullName);
    });
  });

  describe('selectable product list', () => {
    describe('for a generic product', () => {
      it('should display every other generic product', async () => {
        await render();

        expect(getListItemTitles()).toEqual([
          sourceGeneric1.name,
          sourceGeneric2.name,
        ]);
      });

      it('should not display specific or variant products', async () => {
        await render({
          productList: allProducts,
        });

        expect(getListItemTitles()).toEqual([
          sourceGeneric1.name,
          sourceGeneric2.name,
          anotherGeneric.name,
        ]);
      });
    });

    describe('for a specific product', () => {
      it('should display only the other specific products of the same generic product', async () => {
        await render({
          dialogData: targetSpecific,
          productList: allProducts,
        });

        expect(getListItemTitles()).toEqual([
          sourceSpecific1.name,
          sourceSpecific2.name,
        ]);
        expect(getListItemLines()).toEqual([
          `${sourceSpecific1.measurement} ${sourceSpecific1.unitOfMeasurement}`,
          `${sourceSpecific2.measurement} ${sourceSpecific2.unitOfMeasurement}`,
        ]);
      });

      it('should display nothing if the generic product has no other specific products', async () => {
        await render({
          dialogData: otherSpecific,
          productList: allProducts,
        });

        expect(getListItems().length).toBe(0);
      });
    });

    describe('for a variant product', () => {
      it('should display only the other variant products of the same specific product', async () => {
        await render({
          dialogData: targetVariant,
          productList: allProducts,
        });

        expect(getListItemTitles()).toEqual([
          sourceVariant1.name,
          sourceVariant2.name,
        ]);
      });

      it('should display nothing if the specific product has no other variant products', async () => {
        await render({
          dialogData: otherVariant,
          productList: allProducts,
        });

        expect(getListItems().length).toBe(0);
      });
    });

    describe('should display nothing', () => {
      it('if the merge target is the only product on its level', async () => {
        await render({
          productList: [targetGeneric],
        });

        expect(getListItems().length).toBe(0);
      });
    });

    describe('on click', () => {
      it('should select the product and remove it from the list', async () => {
        await render();

        getListItems()[0].nativeElement.click();

        await fixture.whenStable();

        expect(getListItemTitles()).toEqual([sourceGeneric2.fullName]);
        expect(fixture.componentInstance.selectedProducts()).toEqual([sourceGeneric1]);
      });
    });
  });

  describe('selected product chips', () => {
    it('should not be rendered by default', async () => {
      await render();

      expect(getChips().length).toBe(0);
    });

    it('should be rendered with the full name for each selected product', async () => {
      await render();

      getListItems()[0].nativeElement.click();
      await fixture.whenStable();

      getListItems()[0].nativeElement.click();
      await fixture.whenStable();

      const chips = getChips();
      expect(chips.length).toBe(2);
      expect(chips[0].nativeElement.textContent).toContain(sourceGeneric1.fullName);
      expect(chips[1].nativeElement.textContent).toContain(sourceGeneric2.fullName);
    });

    describe('on click', () => {
      it('should deselect the product and put it back to the list', async () => {
        await render();

        getListItems()[0].nativeElement.click();
        await fixture.whenStable();

        getChips()[0].nativeElement.click();
        await fixture.whenStable();

        expect(getChips().length).toBe(0);
        expect(getListItems().length).toBe(2);
        expect(fixture.componentInstance.selectedProducts()).toEqual([]);
      });
    });
  });

  describe('save button', () => {
    it('should be disabled if no product is selected', async () => {
      await render();

      expect(getSaveButton().nativeElement.disabled).toBe(true);
    });

    it('should be enabled if a product is selected', async () => {
      await render();

      getListItems()[0].nativeElement.click();

      await fixture.whenStable();

      expect(getSaveButton().nativeElement.disabled).toBe(false);
    });

    it('should close the dialog with the selected products if clicked', async () => {
      await render();

      getListItems()[0].nativeElement.click();
      await fixture.whenStable();

      getListItems()[0].nativeElement.click();
      await fixture.whenStable();

      getSaveButton().nativeElement.click();

      validateFunctionCall(mockDialogRef.functions.close, {
        sourceProductIds: [
          sourceGeneric1.productId,
          sourceGeneric2.productId,
        ],
        targetProductId: targetGeneric.productId,
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
