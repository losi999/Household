import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductListItem } from './product-list-item';
import { productEvents } from '@household/state/product/product-events';
import { createStubComponent, elementSelectorFactory, IElementSelector, MockSignalStore, provideMockDispatcher, provideMockSignalStore } from '@household/shared-ui';
import { ProductStore } from '@household/state/product/product-store';
import { Api } from '@household/shared/types/api';
import { Responses } from '@household/shared/types/responses';
import { ProductType } from '@household/shared/enums';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { validateFunctionCall } from '@household/shared/common/unit-testing';
import { Dispatcher } from '@ngrx/signals/events';
import { MatListItem, MatListItemLine, MatListItemTitle } from '@angular/material/list';
import { GenericProductIcon, SpecificProductIcon, VariantProductIcon } from '@household/app/shared/icons';

describe('ProductListItem', () => {
  const GenericProductIconStub = createStubComponent(GenericProductIcon);
  const SpecificProductIconStub = createStubComponent(SpecificProductIcon);
  const VariantProductIconStub = createStubComponent(VariantProductIcon);

  let fixture: ComponentFixture<ProductListItem>;
  let selector: IElementSelector;
  let mockProductStore: MockSignalStore<typeof ProductStore>;
  let mockDispatcher: Dispatcher;

  const generic = testDataFactory.product.response.generic();
  const specific = testDataFactory.product.response.specific({
    genericProduct: generic,
  });
  const variant = testDataFactory.product.response.variant({
    specificProduct: specific,
  });

  const render = async (params?: {
    product?: Responses.Product;
    isInProgress?: Api.Product.Id[];
    productList?: Responses.Product[];
  }) => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [ProductListItem],
      providers: [
        provideMockSignalStore(ProductStore, 'isInProgress', 'productList'),
        provideMockDispatcher(),
      ],
    }).overrideComponent(ProductListItem, {
      remove: {
        imports: [
          GenericProductIcon,
          SpecificProductIcon,
          VariantProductIcon,
        ],
      },
      add: {
        imports: [
          GenericProductIconStub,
          SpecificProductIconStub,
          VariantProductIconStub,
        ],
      },
    })
      .compileComponents();

    mockProductStore = TestBed.inject<MockSignalStore<typeof ProductStore>>(ProductStore);
    mockDispatcher = TestBed.inject(Dispatcher);

    mockProductStore.isInProgress.set(params?.isInProgress ?? []);
    mockProductStore.productList.set(params?.productList ?? []);

    fixture = TestBed.createComponent(ProductListItem);
    fixture.componentRef.setInput('product', params?.product ?? generic);

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
        isInProgress: [generic.productId],
      });

      expect(getElement().nativeElement.disabled).toBe(true);
    });

    describe('on click', () => {
      it('should dispatch openProductListItemSubmenu for a product with children', async () => {
        await render({
          product: specific,
          productList: [
            generic,
            specific,
            variant,
          ],
        });

        getElement().nativeElement.click();

        validateFunctionCall(mockDispatcher.dispatch, productEvents.openProductListItemSubmenu({
          product: specific,
          hasChildren: true,
        }), {
          scope: 'self',
        });
      });

      it('should dispatch openProductListItemSubmenu for a product without children', async () => {
        await render({
          product: variant,
          productList: [
            generic,
            specific,
            variant,
          ],
        });

        getElement().nativeElement.click();

        validateFunctionCall(mockDispatcher.dispatch, productEvents.openProductListItemSubmenu({
          product: variant,
          hasChildren: false,
        }), {
          scope: 'self',
        });
      });

      it('should not dispatch anything if disabled', async () => {
        await render({
          isInProgress: [generic.productId],
        });

        getElement().nativeElement.click();

        validateFunctionCall(mockDispatcher.dispatch);
      });
    });
  });

  describe('title', () => {
    it('should be the name of a generic product', async () => {
      await render({
        product: generic,
      });

      expect(selector.getComponent(MatListItemTitle, MatListItem).nativeElement.textContent).toBe(generic.name);
    });

    it('should be the name of a specific product', async () => {
      await render({
        product: specific,
      });

      expect(selector.getComponent(MatListItemTitle, MatListItem).nativeElement.textContent).toBe(specific.name);
    });

    it('should be the name of a variant product', async () => {
      await render({
        product: variant,
      });

      expect(selector.getComponent(MatListItemTitle, MatListItem).nativeElement.textContent).toBe(variant.name);
    });
  });

  describe('measurement', () => {
    it('should be rendered for specific product', async () => {
      await render({
        product: specific,
      });

      expect(selector.getComponent(MatListItemLine, MatListItem).nativeElement.textContent).toBe(`${specific.measurement} ${specific.unitOfMeasurement}`);
    });

    it('should not be rendered for generic product', async () => {
      await render({
        product: generic,
      });

      expect(selector.getComponent(MatListItemLine, MatListItem)).toBeFalsy();
    });

    it('should not be rendered for variant product', async () => {
      await render({
        product: variant,
      });

      expect(selector.getComponent(MatListItemLine, MatListItem)).toBeFalsy();
    });
  });

  describe('icon', () => {
    it('should be rendered for generic product', async () => {
      await render({
        product: generic,
      });

      expect(selector.getComponent(GenericProductIconStub)).toBeTruthy();
    });

    it('should be rendered for specific product', async () => {
      await render({
        product: specific,
      });

      expect(selector.getComponent(SpecificProductIconStub)).toBeTruthy();
    });

    it('should be rendered for variant product', async () => {
      await render({
        product: variant,
      });

      expect(selector.getComponent(VariantProductIconStub)).toBeTruthy();
    });
  });

  describe('host class', () => {
    // the product type classes the host of the component has
    const getProductTypeClasses = () => {
      return Object.values(ProductType).filter(productType => fixture.nativeElement.classList.contains(productType));
    };

    it('should be the generic class for generic product', async () => {
      await render({
        product: generic,
      });

      expect(getProductTypeClasses()).toEqual([ProductType.Generic]);
    });

    it('should be the specific class for specific product', async () => {
      await render({
        product: specific,
      });

      expect(getProductTypeClasses()).toEqual([ProductType.Specific]);
    });

    it('should be the variant class for variant product', async () => {
      await render({
        product: variant,
      });

      expect(getProductTypeClasses()).toEqual([ProductType.Variant]);
    });

    it('should follow the product if it changes', async () => {
      await render({
        product: generic,
      });

      fixture.componentRef.setInput('product', variant);
      await fixture.whenStable();

      expect(getProductTypeClasses()).toEqual([ProductType.Variant]);
    });
  });
});
