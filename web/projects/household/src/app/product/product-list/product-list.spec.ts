import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductList } from './product-list';
import { createStubComponent, elementSelectorFactory, IElementSelector } from '@household/shared-ui';
import { ProductListItem } from '@household/app/product/product-list-item/product-list-item';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { MatActionList } from '@angular/material/list';
import { Responses } from '@household/shared/types/responses';

describe('ProductList', () => {
  const ProductListItemStub = createStubComponent(ProductListItem);

  let fixture: ComponentFixture<ProductList>;
  let selector: IElementSelector;

  const variant1 = testDataFactory.product.treeItem.variant({
    name: 'variant 1',
  });
  const variant2 = testDataFactory.product.treeItem.variant({
    name: 'variant 2',
  });
  const specific1 = testDataFactory.product.treeItem.specific({
    name: 'specific 1',
    children: [
      variant1,
      variant2,
    ],
  });
  const specific2 = testDataFactory.product.treeItem.specific({
    name: 'specific 2',
  });
  const generic1 = testDataFactory.product.tree({
    children: [
      specific1,
      specific2,
    ],
  });
  const generic2 = testDataFactory.product.tree();

  const products = [
    generic1,
    generic2,
  ];

  const render = async (productList: Responses.ProductTree[] = products) => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [ProductList],
    })
      .overrideComponent(ProductList, {
        remove: {
          imports: [ProductListItem],
        },
        add: {
          imports: [ProductListItemStub],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ProductList);
    fixture.componentRef.setInput('products', productList);

    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  };

  describe('action list', () => {
    it('should be rendered', async () => {
      await render();

      expect(selector.getComponent(MatActionList)).toBeTruthy();
    });
  });

  describe('list items', () => {
    it('should be rendered for every product of the tree, each parent followed by its children', async () => {
      await render();

      const listItems = selector.listComponents<ProductListItem>(ProductListItemStub, MatActionList);

      expect(listItems.map(listItem => listItem.componentInstance.product())).toEqual([
        generic1,
        specific1,
        variant1,
        variant2,
        specific2,
        generic2,
      ]);
    });

    it('should be rendered for generic products without children', async () => {
      await render([generic2]);

      const listItems = selector.listComponents<ProductListItem>(ProductListItemStub, MatActionList);

      expect(listItems.length).toBe(1);
      expect(listItems[0].componentInstance.product()).toEqual(generic2);
    });

    it('should not be rendered if there are no products', async () => {
      await render([]);

      expect(selector.listComponents(ProductListItemStub, MatActionList).length).toBe(0);
    });
  });
});
