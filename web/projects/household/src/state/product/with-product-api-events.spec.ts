import { TestBed } from '@angular/core/testing';
import { ProductService } from '@household/services/product-service';
import { createDispatcherSpy, notificationEvents, validateDispatcher } from '@household/shared-ui';
import { Dispatcher } from '@ngrx/signals/events';
import { signalStore } from '@ngrx/signals';
import { Mock } from 'vitest';
import { createMockService, MockService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { productApiEvents } from '@household/state/product/product-events';
import { withProductApiEvents } from '@household/state/product/with-product-api-events';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { of, throwError } from 'rxjs';

describe('withProductApiEvents', () => {
  let dispatcher: Dispatcher;
  let dispatchSpy: Mock;
  let mockProductService: MockService<ProductService>;

  const setup = () => {
    TestBed.resetTestingModule();

    mockProductService = createMockService('listProducts', 'createProduct', 'updateProduct', 'deleteProduct', 'mergeProducts');

    TestBed.configureTestingModule({
      providers: [
        {
          provide: ProductService,
          useValue: mockProductService.service,
        },
      ],
    });

    TestBed.inject(signalStore({
      providedIn: 'root',
    }, withProductApiEvents()));
    dispatcher = TestBed.inject(Dispatcher);
    dispatchSpy = createDispatcherSpy(dispatcher);
  };

  beforeEach(() => {
    setup();
  });

  describe('dispatching listProductsInitiated', () => {
    it('should call API and dispatch response', () => {
      const productList = [testDataFactory.product.response.generic()];
      mockProductService.functions.listProducts.mockReturnValue(of(productList));

      dispatcher.dispatch(productApiEvents.listProductsInitiated());

      expect(mockProductService.functions.listProducts).toHaveBeenCalled();
      validateDispatcher(dispatchSpy, productApiEvents.listProductsCompleted(productList));
    });

    it('should call API and show notification if there is an error', () => {
      mockProductService.functions.listProducts.mockReturnValue(throwError(() => ({
        error: {
          message: 'There is an error',
        },
      })));

      dispatcher.dispatch(productApiEvents.listProductsInitiated());

      expect(mockProductService.functions.listProducts).toHaveBeenCalled();
      validateDispatcher(dispatchSpy, notificationEvents.showMessage('Hiba történt'));
    });
  });

  describe('dispatching createProductInitiated', () => {
    const productRequest = testDataFactory.product.request.generic();
    const productId = testDataFactory.product.id();

    it('should call API and dispatch response', () => {
      mockProductService.functions.createProduct.mockReturnValue(of({
        productId,
      }));

      dispatcher.dispatch(productApiEvents.createProductInitiated(productRequest));

      validateFunctionCall(mockProductService.functions.createProduct, productRequest);
      validateDispatcher(dispatchSpy, productApiEvents.createProductCompleted({
        productId,
        ...productRequest,
      }));
    });

    it('should call API and show notification if product name is already taken', () => {
      mockProductService.functions.createProduct.mockReturnValue(throwError(() => ({
        error: {
          message: 'Duplicate product name',
        },
      })));

      dispatcher.dispatch(productApiEvents.createProductInitiated(productRequest));

      validateFunctionCall(mockProductService.functions.createProduct, productRequest);
      validateDispatcher(dispatchSpy, notificationEvents.showMessage(`Termék (${productRequest.name}) már létezik!`));
    });

    it('should call API and show notification if there is an error', () => {
      mockProductService.functions.createProduct.mockReturnValue(throwError(() => ({
        error: {
          message: 'There is an error',
        },
      })));

      dispatcher.dispatch(productApiEvents.createProductInitiated(productRequest));

      validateFunctionCall(mockProductService.functions.createProduct, productRequest);
      validateDispatcher(dispatchSpy, notificationEvents.showMessage('Hiba történt'));
    });
  });

  describe('dispatching updateProductInitiated', () => {
    const productRequest = testDataFactory.product.request.specific();
    const productId = testDataFactory.product.id();

    it('should call API and dispatch response', () => {
      mockProductService.functions.updateProduct.mockReturnValue(of(undefined));

      dispatcher.dispatch(productApiEvents.updateProductInitiated({
        productId,
        ...productRequest,
      }));

      validateFunctionCall(mockProductService.functions.updateProduct, productId, productRequest);
      validateDispatcher(dispatchSpy, productApiEvents.updateProductCompleted({
        productId,
        ...productRequest,
      }));
    });

    it('should call API and show notification if product name is already taken', () => {
      mockProductService.functions.updateProduct.mockReturnValue(throwError(() => ({
        error: {
          message: 'Duplicate product name',
        },
      })));

      dispatcher.dispatch(productApiEvents.updateProductInitiated({
        productId,
        ...productRequest,
      }));

      validateFunctionCall(mockProductService.functions.updateProduct, productId, productRequest);
      validateDispatcher(dispatchSpy, productApiEvents.updateProductFailed({
        productId,
      }), notificationEvents.showMessage(`Termék (${productRequest.name}) már létezik!`));
    });

    it('should call API and show notification if there is an error', () => {
      mockProductService.functions.updateProduct.mockReturnValue(throwError(() => ({
        error: {
          message: 'There is an error',
        },
      })));

      dispatcher.dispatch(productApiEvents.updateProductInitiated({
        productId,
        ...productRequest,
      }));

      validateFunctionCall(mockProductService.functions.updateProduct, productId, productRequest);
      validateDispatcher(dispatchSpy, productApiEvents.updateProductFailed({
        productId,
      }), notificationEvents.showMessage('Hiba történt'));
    });
  });

  describe('dispatching deleteProductInitiated', () => {
    const productId = testDataFactory.product.id();

    it('should call API and dispatch response', () => {
      mockProductService.functions.deleteProduct.mockReturnValue(of(undefined));

      dispatcher.dispatch(productApiEvents.deleteProductInitiated({
        productId,
      }));

      validateFunctionCall(mockProductService.functions.deleteProduct, productId);
      validateDispatcher(dispatchSpy, productApiEvents.deleteProductCompleted({
        productId,
      }));
    });

    it('should call API and show notification if there is an error', () => {
      mockProductService.functions.deleteProduct.mockReturnValue(throwError(() => ({
        error: {
          message: 'There is an error',
        },
      })));

      dispatcher.dispatch(productApiEvents.deleteProductInitiated({
        productId,
      }));

      validateFunctionCall(mockProductService.functions.deleteProduct, productId);
      validateDispatcher(dispatchSpy, productApiEvents.deleteProductFailed({
        productId,
      }), notificationEvents.showMessage('Hiba történt'));
    });
  });

  describe('dispatching mergeProductsInitiated', () => {
    const targetProductId = testDataFactory.product.id();
    const sourceProductId = testDataFactory.product.id();

    it('should call API and dispatch response', () => {
      mockProductService.functions.mergeProducts.mockReturnValue(of(undefined));

      dispatcher.dispatch(productApiEvents.mergeProductsInitiated({
        sourceProductIds: [sourceProductId],
        targetProductId,
      }));

      validateFunctionCall(mockProductService.functions.mergeProducts, targetProductId, [sourceProductId]);
      validateDispatcher(dispatchSpy, productApiEvents.mergeProductsCompleted({
        sourceProductIds: [sourceProductId],
        targetProductId,
      }));
    });

    it('should call API and show notification if there is an error', () => {
      mockProductService.functions.mergeProducts.mockReturnValue(throwError(() => ({
        error: {
          message: 'There is an error',
        },
      })));

      dispatcher.dispatch(productApiEvents.mergeProductsInitiated({
        sourceProductIds: [sourceProductId],
        targetProductId,
      }));

      validateFunctionCall(mockProductService.functions.mergeProducts, targetProductId, [sourceProductId]);
      validateDispatcher(dispatchSpy, productApiEvents.mergeProductsFailed({
        sourceProductIds: [sourceProductId],
      }), notificationEvents.showMessage('Hiba történt'));
    });
  });
});
