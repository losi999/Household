import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductListItem } from './product-list-item';
import { productEvents, ProductTreeNode } from '@household/state/product/product-events';
import { elementSelectorFactory, IElementSelector, MockSignalStore, provideMockDispatcher, provideMockSignalStore } from '@household/shared-ui';
import { ProductStore } from '@household/state/product/product-store';
import { Api } from '@household/shared/types/api';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { validateFunctionCall } from '@household/shared/common/unit-testing';
import { Dispatcher } from '@ngrx/signals/events';
import { MatListItem, MatListItemIcon, MatListItemLine, MatListItemTitle } from '@angular/material/list';

describe('ProductListItem', () => {
  let fixture: ComponentFixture<ProductListItem>;
  let selector: IElementSelector;
  let mockProductStore: MockSignalStore<typeof ProductStore>;
  let mockDispatcher: Dispatcher;

  const genericProduct: ProductTreeNode = testDataFactory.product.tree();
  const specificProduct: ProductTreeNode = testDataFactory.product.treeItem.specific({
    name: 'specific product',
    measurement: 500,
    unitOfMeasurement: 'g',
  });
  const variantProduct: ProductTreeNode = testDataFactory.product.treeItem.variant({
    name: 'variant product',
  });

  const render = async (params?: {
    product?: ProductTreeNode;
    isInProgress?: Api.Product.Id[];
  }) => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [ProductListItem],
      providers: [
        provideMockSignalStore(ProductStore, 'isInProgress'),
        provideMockDispatcher(),
      ],
    })
      .compileComponents();

    mockProductStore = TestBed.inject<MockSignalStore<typeof ProductStore>>(ProductStore);
    mockDispatcher = TestBed.inject(Dispatcher);

    mockProductStore.isInProgress.set(params?.isInProgress ?? []);

    fixture = TestBed.createComponent(ProductListItem);
    fixture.componentRef.setInput('product', params?.product ?? genericProduct);

    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  };

  describe('list item button', () => {
    const getElement = () => {
      return selector.getComponent<MatListItem, HTMLButtonElement>(MatListItem);
    };

    it('should be rendered', async () => {
      await render();

      expect(getElement()).toBeTruthy();
    });

    it('should be enabled if product is not in progress', async () => {
      await render({
        isInProgress: [testDataFactory.product.id()],
      });

      expect(getElement().nativeElement.disabled).toBe(false);
    });

    it('should be disabled if product is in progress', async () => {
      await render({
        isInProgress: [genericProduct.productId],
      });

      expect(getElement().nativeElement.disabled).toBe(true);
    });

    describe('on click', () => {
      it('should not dispatch anything if disabled', async () => {
        await render({
          isInProgress: [genericProduct.productId],
        });

        getElement().nativeElement.click();

        validateFunctionCall(mockDispatcher.dispatch);
      });

      it('should dispatch openProductListItemSubmenu for a generic product', async () => {
        await render({
          product: genericProduct,
        });

        getElement().nativeElement.click();

        validateFunctionCall(mockDispatcher.dispatch, productEvents.openProductListItemSubmenu(genericProduct), {
          scope: 'self',
        });
      });

      it('should dispatch openProductListItemSubmenu for a specific product', async () => {
        await render({
          product: specificProduct,
        });

        getElement().nativeElement.click();

        validateFunctionCall(mockDispatcher.dispatch, productEvents.openProductListItemSubmenu(specificProduct), {
          scope: 'self',
        });
      });

      it('should dispatch openProductListItemSubmenu for a variant product', async () => {
        await render({
          product: variantProduct,
        });

        getElement().nativeElement.click();

        validateFunctionCall(mockDispatcher.dispatch, productEvents.openProductListItemSubmenu(variantProduct), {
          scope: 'self',
        });
      });
    });
  });

  describe('name', () => {
    it('should be rendered for generic product', async () => {
      await render({
        product: genericProduct,
      });

      expect(selector.getComponent(MatListItemTitle, MatListItem).nativeElement.textContent).toBe(genericProduct.name);
    });

    it('should be rendered for specific product', async () => {
      await render({
        product: specificProduct,
      });

      expect(selector.getComponent(MatListItemTitle, MatListItem).nativeElement.textContent).toBe(specificProduct.name);
    });

    it('should be rendered for variant product', async () => {
      await render({
        product: variantProduct,
      });

      expect(selector.getComponent(MatListItemTitle, MatListItem).nativeElement.textContent).toBe(variantProduct.name);
    });
  });

  describe('measurement', () => {
    it('should be rendered for specific product', async () => {
      await render({
        product: specificProduct,
      });

      expect(selector.getComponent(MatListItemLine, MatListItem).nativeElement.textContent).toBe('500 g');
    });

    it('should not be rendered for generic product', async () => {
      await render({
        product: genericProduct,
      });

      expect(selector.getComponent(MatListItemLine, MatListItem)).toBeFalsy();
    });

    it('should not be rendered for variant product', async () => {
      await render({
        product: variantProduct,
      });

      expect(selector.getComponent(MatListItemLine, MatListItem)).toBeFalsy();
    });
  });

  describe('icon', () => {
    it('should be rendered for generic product', async () => {
      await render({
        product: genericProduct,
      });

      expect(selector.getComponent(MatListItemIcon, MatListItem).nativeElement.textContent).toBe('sell');
    });

    it('should be rendered for specific product', async () => {
      await render({
        product: specificProduct,
      });

      expect(selector.getComponent(MatListItemIcon, MatListItem).nativeElement.textContent).toBe('scale');
    });

    it('should be rendered for variant product', async () => {
      await render({
        product: variantProduct,
      });

      expect(selector.getComponent(MatListItemIcon, MatListItem).nativeElement.textContent).toBe('label');
    });
  });

  describe('indentation', () => {
    it('should not be indented for generic product', async () => {
      await render({
        product: genericProduct,
      });

      expect(fixture.componentInstance.indentation()).toBe(0);
    });

    it('should be indented one level for specific product', async () => {
      await render({
        product: specificProduct,
      });

      expect(fixture.componentInstance.indentation()).toBe(1);
      expect(fixture.nativeElement.style.paddingLeft).toBe('1rem');
    });

    it('should be indented two levels for variant product', async () => {
      await render({
        product: variantProduct,
      });

      expect(fixture.componentInstance.indentation()).toBe(2);
      expect(fixture.nativeElement.style.paddingLeft).toBe('2rem');
    });
  });
});
