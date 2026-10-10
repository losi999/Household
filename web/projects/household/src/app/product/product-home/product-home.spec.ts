import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductHome } from './product-home';
import { createStubComponent, elementSelectorFactory, IElementSelector, MockSignalStore, provideMockDispatcher, provideMockSignalStore } from '@household/shared-ui';
import { Toolbar } from '@household/app/shared/toolbar/toolbar';
import { ProductList } from '@household/app/product/product-list/product-list';
import { ProductStore } from '@household/state/product/product-store';
import { productApiEvents, productEvents } from '@household/state/product/product-events';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { validateFunctionCall } from '@household/shared/common/unit-testing';
import { Dispatcher } from '@ngrx/signals/events';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { Responses } from '@household/shared/types/responses';

describe('ProductHome', () => {
  const ToolbarStub = createStubComponent(Toolbar);
  const ProductListStub = createStubComponent(ProductList);

  let fixture: ComponentFixture<ProductHome>;
  let selector: IElementSelector;
  let mockProductStore: MockSignalStore<typeof ProductStore>;
  let mockDispatcher: Dispatcher;

  const products = [
    testDataFactory.product.tree(),
    testDataFactory.product.tree(),
  ];

  const render = async (productList: Responses.ProductTree[] = products) => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [ProductHome],
      providers: [
        provideMockSignalStore(ProductStore, 'productList'),
        provideMockDispatcher(),
      ],
    })
      .overrideComponent(ProductHome, {
        remove: {
          imports: [
            Toolbar,
            ProductList,
          ],
        },
        add: {
          imports: [
            ToolbarStub,
            ProductListStub,
          ],
        },
      })
      .compileComponents();

    mockProductStore = TestBed.inject<MockSignalStore<typeof ProductStore>>(ProductStore);
    mockDispatcher = TestBed.inject(Dispatcher);

    mockProductStore.productList.set(productList);

    fixture = TestBed.createComponent(ProductHome);

    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  };

  describe('on init', () => {
    it('should dispatch listProductsInitiated', async () => {
      await render();

      validateFunctionCall(mockDispatcher.dispatch, productApiEvents.listProductsInitiated(), {
        scope: 'self',
      });
    });
  });

  describe('toolbar', () => {
    it('should be rendered with the title', async () => {
      await render();

      expect(selector.getComponent<Toolbar>(ToolbarStub).componentInstance.title()).toBe('Termékek');
    });
  });

  describe('create button', () => {
    const getElement = () => {
      return selector.getComponent<MatIconButton, HTMLButtonElement>(MatIconButton, ToolbarStub);
    };

    it('should be rendered', async () => {
      await render();

      expect(selector.getComponent(MatIcon, ToolbarStub).nativeElement.textContent).toBe('add');
    });

    it('should dispatch createProduct if clicked', async () => {
      await render();

      getElement().nativeElement.click();

      validateFunctionCall(mockDispatcher.dispatch, productEvents.createProduct(), {
        scope: 'self',
      });
    });
  });

  describe('product list', () => {
    it('should be rendered with the products of the store', async () => {
      await render();

      expect(selector.getComponent<ProductList>(ProductListStub).componentInstance.products()).toEqual(products);
    });

    it('should be rendered with an empty list', async () => {
      await render([]);

      expect(selector.getComponent<ProductList>(ProductListStub).componentInstance.products()).toEqual([]);
    });
  });
});
