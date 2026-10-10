import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductMergeDialog, ProductMergeDialogData } from './product-merge-dialog';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { elementSelectorFactory, IElementSelector, MockSignalStore, provideMockSignalStore } from '@household/shared-ui';
import { ProductStore } from '@household/state/product/product-store';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { createMockService, MockService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { MatActionList, MatListItem } from '@angular/material/list';
import { MatChip, MatChipSet } from '@angular/material/chips';
import { Responses } from '@household/shared/types/responses';

describe('ProductMergeDialog', () => {
  let fixture: ComponentFixture<ProductMergeDialog>;
  let selector: IElementSelector;
  let mockProductStore: MockSignalStore<typeof ProductStore>;
  let mockDialogRef: MockService<MatDialogRef<ProductMergeDialog>>;

  const targetGeneric = testDataFactory.product.tree({
    name: 'target generic',
  });
  const sourceGeneric1 = testDataFactory.product.tree({
    name: 'source generic 1',
  });
  const sourceGeneric2 = testDataFactory.product.tree({
    name: 'source generic 2',
  });

  const targetVariant = testDataFactory.product.treeItem.variant({
    name: 'target variant',
  });
  const sourceVariant1 = testDataFactory.product.treeItem.variant({
    name: 'source variant 1',
  });
  const sourceVariant2 = testDataFactory.product.treeItem.variant({
    name: 'source variant 2',
  });
  const otherVariant = testDataFactory.product.treeItem.variant({
    name: 'variant of another specific product',
  });

  const targetSpecific = testDataFactory.product.treeItem.specific({
    name: 'target specific',
    measurement: 1,
    unitOfMeasurement: 'kg',
    fullName: 'target specific 1 kg',
    children: [
      targetVariant,
      sourceVariant1,
      sourceVariant2,
    ],
  });
  const sourceSpecific1 = testDataFactory.product.treeItem.specific({
    name: 'source specific 1',
    fullName: 'source specific 1 2 kg',
  });
  const sourceSpecific2 = testDataFactory.product.treeItem.specific({
    name: 'source specific 2',
    fullName: 'source specific 2 3 kg',
  });
  const otherSpecific = testDataFactory.product.treeItem.specific({
    name: 'specific of another generic product',
    children: [otherVariant],
  });

  // the specific products and variant products live under this generic product
  const parentGeneric = testDataFactory.product.tree({
    children: [
      targetSpecific,
      sourceSpecific1,
      sourceSpecific2,
    ],
  });
  const anotherGeneric = testDataFactory.product.tree({
    children: [otherSpecific],
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
    dialogData?: ProductMergeDialogData;
    productList?: Responses.ProductTree[];
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
    it('should display the name of a generic product', async () => {
      await render();

      expect(selector.getComponent(MatDialogTitle).nativeElement.textContent).toContain(targetGeneric.name);
    });

    it('should display the full name of a specific product', async () => {
      await render({
        dialogData: targetSpecific,
        productList: [parentGeneric],
      });

      expect(selector.getComponent(MatDialogTitle).nativeElement.textContent).toContain(targetSpecific.fullName);
    });

    it('should display the name of a variant product', async () => {
      await render({
        dialogData: targetVariant,
        productList: [parentGeneric],
      });

      expect(selector.getComponent(MatDialogTitle).nativeElement.textContent).toContain(targetVariant.name);
    });
  });

  describe('selectable product list', () => {
    describe('for a generic product', () => {
      it('should display every other generic product', async () => {
        await render();

        const listItems = getListItems();

        expect(listItems.length).toBe(2);
        expect(listItems[0].nativeElement.textContent.trim()).toBe(sourceGeneric1.name);
        expect(listItems[1].nativeElement.textContent.trim()).toBe(sourceGeneric2.name);
      });

      it('should not display its own specific products', async () => {
        const genericWithChildren = testDataFactory.product.tree({
          children: [sourceSpecific1],
        });

        await render({
          dialogData: genericWithChildren,
          productList: [
            genericWithChildren,
            sourceGeneric1,
          ],
        });

        const listItems = getListItems();

        expect(listItems.length).toBe(1);
        expect(listItems[0].nativeElement.textContent.trim()).toBe(sourceGeneric1.name);
      });
    });

    describe('for a specific product', () => {
      it('should display only the other specific products of the same generic product, by full name', async () => {
        await render({
          dialogData: targetSpecific,
          productList: [
            targetGeneric,
            parentGeneric,
            anotherGeneric,
          ],
        });

        const listItems = getListItems();

        expect(listItems.length).toBe(2);
        expect(listItems[0].nativeElement.textContent.trim()).toBe(sourceSpecific1.fullName);
        expect(listItems[1].nativeElement.textContent.trim()).toBe(sourceSpecific2.fullName);
      });

      it('should not display the specific products of another generic product or any generic product', async () => {
        await render({
          dialogData: otherSpecific,
          productList: [
            targetGeneric,
            parentGeneric,
            anotherGeneric,
          ],
        });

        expect(getListItems().length).toBe(0);
      });
    });

    describe('for a variant product', () => {
      it('should display only the other variant products of the same specific product', async () => {
        await render({
          dialogData: targetVariant,
          productList: [
            parentGeneric,
            anotherGeneric,
          ],
        });

        const listItems = getListItems();

        expect(listItems.length).toBe(2);
        expect(listItems[0].nativeElement.textContent.trim()).toBe(sourceVariant1.name);
        expect(listItems[1].nativeElement.textContent.trim()).toBe(sourceVariant2.name);
      });

      it('should not display the variant products of another specific product', async () => {
        await render({
          dialogData: otherVariant,
          productList: [
            parentGeneric,
            anotherGeneric,
          ],
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

      it('if the merge target cannot be found in the store', async () => {
        await render({
          dialogData: targetSpecific,
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

        const listItems = getListItems();
        expect(listItems.length).toBe(1);
        expect(listItems[0].nativeElement.textContent.trim()).toBe(sourceGeneric2.name);
        expect(fixture.componentInstance.selectedProducts()).toEqual([sourceGeneric1]);
      });
    });
  });

  describe('selected product chips', () => {
    it('should not be rendered by default', async () => {
      await render();

      expect(getChips().length).toBe(0);
    });

    it('should be rendered for each selected product', async () => {
      await render();

      getListItems()[0].nativeElement.click();
      await fixture.whenStable();

      getListItems()[0].nativeElement.click();
      await fixture.whenStable();

      const chips = getChips();
      expect(chips.length).toBe(2);
      expect(chips[0].nativeElement.textContent).toContain(sourceGeneric1.name);
      expect(chips[1].nativeElement.textContent).toContain(sourceGeneric2.name);
    });

    it('should display the full name of a selected specific product', async () => {
      await render({
        dialogData: targetSpecific,
        productList: [parentGeneric],
      });

      getListItems()[0].nativeElement.click();
      await fixture.whenStable();

      expect(getChips()[0].nativeElement.textContent).toContain(sourceSpecific1.fullName);
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
