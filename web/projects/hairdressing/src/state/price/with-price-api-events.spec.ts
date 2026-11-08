import { TestBed } from '@angular/core/testing';
import { PriceService } from '@hairdressing/services/price-service';
import { priceApiEvents } from '@hairdressing/state/price/price-events';
import { withPriceApiEvents } from '@hairdressing/state/price/with-price-api-events';
import { createDispatcherSpy, notificationEvents, validateDispatcher } from '@household/shared-ui';
import { createMockService, MockService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { signalStore } from '@ngrx/signals';
import { Dispatcher } from '@ngrx/signals/events';
import { of, throwError } from 'rxjs';
import { Mock } from 'vitest';

describe('withPriceApiEvents', () => {
  let dispatcher: Dispatcher;
  let dispatchSpy: Mock;
  let mockPriceService: MockService<PriceService>;

  const setup = () => {
    TestBed.resetTestingModule();

    mockPriceService = createMockService('listPrices', 'createPrice', 'updatePrice', 'deletePrice');

    TestBed.configureTestingModule({
      providers: [
        {
          provide: PriceService,
          useValue: mockPriceService.service,
        },
      ],
    });

    TestBed.inject(signalStore({
      providedIn: 'root',
    }, withPriceApiEvents()));
    dispatcher = TestBed.inject(Dispatcher);
    dispatchSpy = createDispatcherSpy(dispatcher);
  };

  beforeEach(() => {
    setup();
  });

  describe('dispatching listPricesInitiated', () => {
    it('should call API and dispatch response', () => {
      const priceList = [testDataFactory.price.response()];
      mockPriceService.functions.listPrices.mockReturnValue(of(priceList));

      dispatcher.dispatch(priceApiEvents.listPricesInitiated());

      expect(mockPriceService.functions.listPrices).toHaveBeenCalled();
      validateDispatcher(dispatchSpy, priceApiEvents.listPricesCompleted(priceList));
    });

    it('should call API and show notification if there is an error', () => {
      mockPriceService.functions.listPrices.mockReturnValue(throwError(() => ({
        error: {
          message: 'There is an error',
        },
      })));

      dispatcher.dispatch(priceApiEvents.listPricesInitiated());

      expect(mockPriceService.functions.listPrices).toHaveBeenCalled();
      validateDispatcher(dispatchSpy, notificationEvents.showMessage('Hiba történt'));
    });
  });

  describe('dispatching createPriceInitiated', () => {
    const priceRequest = testDataFactory.price.request();
    const priceId = testDataFactory.price.id();

    it('should call API and dispatch response', () => {
      mockPriceService.functions.createPrice.mockReturnValue(of({
        priceId,
      }));

      dispatcher.dispatch(priceApiEvents.createPriceInitiated(priceRequest));

      validateFunctionCall(mockPriceService.functions.createPrice, priceRequest);
      validateDispatcher(dispatchSpy, priceApiEvents.createPriceCompleted({
        priceId,
        ...priceRequest,
      }));
    });

    it('should call API and show notification if price name is already taken', () => {
      mockPriceService.functions.createPrice.mockReturnValue(throwError(() => ({
        error: {
          message: 'Duplicate price name',
        },
      })));

      dispatcher.dispatch(priceApiEvents.createPriceInitiated(priceRequest));

      validateFunctionCall(mockPriceService.functions.createPrice, priceRequest);
      validateDispatcher(dispatchSpy, notificationEvents.showMessage(`Árlista elem (${priceRequest.name}) már létezik!`));
    });

    it('should call API and show notification if there is an error', () => {
      mockPriceService.functions.createPrice.mockReturnValue(throwError(() => ({
        error: {
          message: 'There is an error',
        },
      })));

      dispatcher.dispatch(priceApiEvents.createPriceInitiated(priceRequest));

      validateFunctionCall(mockPriceService.functions.createPrice, priceRequest);
      validateDispatcher(dispatchSpy, notificationEvents.showMessage('Hiba történt'));
    });
  });

  describe('dispatching updatePriceInitiated', () => {
    const priceRequest = testDataFactory.price.request();
    const priceId = testDataFactory.price.id();

    it('should call API and dispatch response', () => {
      mockPriceService.functions.updatePrice.mockReturnValue(of(undefined));

      dispatcher.dispatch(priceApiEvents.updatePriceInitiated({
        priceId,
        ...priceRequest,
      }));

      validateFunctionCall(mockPriceService.functions.updatePrice, priceId, priceRequest);
      validateDispatcher(dispatchSpy, priceApiEvents.updatePriceCompleted({
        priceId,
        ...priceRequest,
      }));
    });

    it('should call API and show notification if price name is already taken', () => {
      mockPriceService.functions.updatePrice.mockReturnValue(throwError(() => ({
        error: {
          message: 'Duplicate price name',
        },
      })));

      dispatcher.dispatch(priceApiEvents.updatePriceInitiated({
        priceId,
        ...priceRequest,
      }));

      validateFunctionCall(mockPriceService.functions.updatePrice, priceId, priceRequest);
      validateDispatcher(dispatchSpy, priceApiEvents.updatePriceFailed({
        priceId,
      }), notificationEvents.showMessage(`Árlista elem (${priceRequest.name}) már létezik!`));
    });

    it('should call API and show notification if there is an error', () => {
      mockPriceService.functions.updatePrice.mockReturnValue(throwError(() => ({
        error: {
          message: 'There is an error',
        },
      })));

      dispatcher.dispatch(priceApiEvents.updatePriceInitiated({
        priceId,
        ...priceRequest,
      }));

      validateFunctionCall(mockPriceService.functions.updatePrice, priceId, priceRequest);
      validateDispatcher(dispatchSpy, priceApiEvents.updatePriceFailed({
        priceId,
      }), notificationEvents.showMessage('Hiba történt'));
    });
  });

  describe('dispatching deletePriceInitiated', () => {
    const priceId = testDataFactory.price.id();

    it('should call API and dispatch response', () => {
      mockPriceService.functions.deletePrice.mockReturnValue(of(undefined));

      dispatcher.dispatch(priceApiEvents.deletePriceInitiated({
        priceId,
      }));

      validateFunctionCall(mockPriceService.functions.deletePrice, priceId);
      validateDispatcher(dispatchSpy, priceApiEvents.deletePriceCompleted({
        priceId,
      }));
    });

    it('should call API and show notification if there is an error', () => {
      mockPriceService.functions.deletePrice.mockReturnValue(throwError(() => ({
        error: {
          message: 'There is an error',
        },
      })));

      dispatcher.dispatch(priceApiEvents.deletePriceInitiated({
        priceId,
      }));

      validateFunctionCall(mockPriceService.functions.deletePrice, priceId);
      validateDispatcher(dispatchSpy, priceApiEvents.deletePriceFailed({
        priceId,
      }), notificationEvents.showMessage('Hiba történt'));
    });
  });
});
