import { TestBed } from '@angular/core/testing';
import { ProductService } from '@household/services/product-service';
import { ProductState, ProductStore, provideProductStoreInitialState } from '@household/state/product/product-store';
import { Dispatcher } from '@ngrx/signals/events';
import { MatDialog } from '@angular/material/dialog';
import { BottomSheetService, DialogService } from '@household/shared-ui';
import { createMockService, MockService } from '@household/shared/common/unit-testing';
import { productApiEvents, productEvents } from '@household/state/product/product-events';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { of } from 'rxjs';

// The behavior of each store feature is covered in its own spec (with-product-reducer.spec.ts,
// with-product-events.spec.ts, with-product-api-events.spec.ts). This spec only verifies that the store provides its initial
// state and has every feature wired in.
describe('Product store', () => {
  let initialState: ProductState;
  let store: InstanceType<typeof ProductStore>;
  let dispatcher: Dispatcher;
  let mockProductService: MockService<ProductService>;
  let mockBottomSheetService: MockService<BottomSheetService>;
  let mockDialogService: MockService<DialogService>;
  let mockMatDialog: MockService<MatDialog>;

  const setup = (initial?: Partial<ProductState>) => {
    TestBed.resetTestingModule();

    initialState = {
      isInProgress: [],
      selectedProduct: undefined,
      productList: [],
      ...initial,
    };

    mockProductService = createMockService('listProducts', 'createProduct', 'updateProduct', 'deleteProduct', 'mergeProducts');
    mockBottomSheetService = createMockService('openBottomSubmenu');
    mockDialogService = createMockService('openConfirmationDialog');
    mockMatDialog = createMockService('open');

    TestBed.configureTestingModule({
      providers: [
        {
          provide: ProductService,
          useValue: mockProductService.service,
        },
        {
          provide: BottomSheetService,
          useValue: mockBottomSheetService.service,
        },
        {
          provide: DialogService,
          useValue: mockDialogService.service,
        },
        {
          provide: MatDialog,
          useValue: mockMatDialog.service,
        },
        provideProductStoreInitialState(initialState),
      ],
    });

    store = TestBed.inject(ProductStore);
    dispatcher = TestBed.inject(Dispatcher);
  };

  it('should initialize with the provided state', () => {
    const productList = [testDataFactory.product.response.generic()];
    const isInProgress = [testDataFactory.product.id()];
    const selectedProduct = testDataFactory.product.response.generic();

    setup({
      productList,
      isInProgress,
      selectedProduct,
    });

    expect(store.productList()).toEqual(productList);
    expect(store.isInProgress()).toEqual(isInProgress);
    expect(store.selectedProduct()).toEqual(selectedProduct);
  });

  it('should initialize with the default state', () => {
    setup();

    expect(store.productList()).toEqual([]);
    expect(store.isInProgress()).toEqual([]);
    expect(store.selectedProduct()).toBeUndefined();
  });

  it('should have the reducer wired in', () => {
    setup();
    const product = testDataFactory.product.response.generic();

    dispatcher.dispatch(productApiEvents.listProductsCompleted([product]));

    expect(store.productList()).toEqual([
      {
        ...product,
        searchTerms: expect.any(Array),
      },
    ]);
  });

  it('should have the UI event handlers wired in', () => {
    setup();
    const product = testDataFactory.product.response.generic();
    mockBottomSheetService.functions.openBottomSubmenu.mockReturnValue({
      afterDismissed: () => of(undefined),
    } as any);

    dispatcher.dispatch(productEvents.openProductListItemSubmenu({
      product,
      hasChildren: false,
    }));

    expect(mockBottomSheetService.functions.openBottomSubmenu).toHaveBeenCalled();
  });

  it('should have the API event handlers and the reducer working together', () => {
    setup();
    const product = testDataFactory.product.response.generic();
    mockProductService.functions.listProducts.mockReturnValue(of([product]));

    dispatcher.dispatch(productApiEvents.listProductsInitiated());

    expect(mockProductService.functions.listProducts).toHaveBeenCalled();
    expect(store.productList()).toEqual([
      {
        ...product,
        searchTerms: expect.any(Array),
      },
    ]);
  });
});
