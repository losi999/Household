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

  const generic = testDataFactory.product.response.generic();
  const specific = testDataFactory.product.response.specific({
    genericProductId: generic.productId,
  });
  const variant = testDataFactory.product.response.variant({
    genericProductId: generic.productId,
    specificProductId: specific.productId,
  });
  const otherGeneric = testDataFactory.product.response.generic();

  // every product is followed by its children
  const products = [
    generic,
    specific,
    variant,
    otherGeneric,
  ];

  const render = async (productList: Responses.Product[] = products) => {
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
    it('should be rendered for every product in the given order', async () => {
      await render();

      const listItems = selector.listComponents<ProductListItem>(ProductListItemStub, MatActionList);

      expect(listItems.map(listItem => listItem.componentInstance.product())).toEqual(products);
    });

    it('should not be rendered if there are no products', async () => {
      await render([]);

      expect(selector.listComponents(ProductListItemStub, MatActionList).length).toBe(0);
    });
  });
});
