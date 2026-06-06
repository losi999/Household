import { TestBed } from '@angular/core/testing';
import { PriceService } from '@hairdressing/services/price-service';
import { PriceState, PriceStore, providePriceStoreInitialState } from '@hairdressing/state/price/price-store';
import { BottomSheetService, createDispatcherSpy, DialogService, notificationEvents, validateDispatcher } from '@household/shared-ui';
import { Dispatcher } from '@ngrx/signals/events';
import { Mock } from 'vitest';
import { createMockService, MockService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { priceApiEvents, priceEvents } from '@hairdressing/state/price/price-events';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { of, throwError } from 'rxjs';
import { PriceDialog } from '@hairdressing/app/price/price-dialog/price-dialog';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { Price } from '@household/shared/types/types';

describe('Price store', () => {
  let initialState: PriceState; 
  let store: InstanceType<typeof PriceStore>;
  let dispatcher: Dispatcher;
  let dispatchSpy: Mock;
  let mockPriceService: MockService<PriceService>;
  let mockDialogService: MockService<DialogService>;
  let mockMatDialog: MockService<MatDialog>;
  let mockBottomSheetService: MockService<BottomSheetService>;

  const validateState = (currentValue?: Partial<PriceState>) => {
    expect(store.isInProgress(), 'isInProgress').toEqual(currentValue?.isInProgress ?? initialState.isInProgress);
    expect(store.priceList(), 'priceList').toEqual(currentValue?.priceList ?? initialState.priceList);
  };

  const setup = (initial?: Partial<PriceState>) => {
    TestBed.resetTestingModule();
    initialState = {
      isInProgress: [],
      priceList: [],
      ...initial,
    };

    TestBed.configureTestingModule({
      providers: [
        {
          provide: PriceService,
          useValue: mockPriceService.service,
        },
        {
          provide: MatDialog,
          useValue: mockMatDialog.service,
        },
        {
          provide: DialogService,
          useValue: mockDialogService.service,
        },
        {
          provide: BottomSheetService,
          useValue: mockBottomSheetService.service,
        },
        providePriceStoreInitialState(initialState),
      ],
    });

    store = TestBed.inject(PriceStore);
    dispatcher = TestBed.inject(Dispatcher);
    dispatchSpy = createDispatcherSpy(dispatcher);
  };

  beforeEach(() => {
    mockPriceService = createMockService('listPrices', 'createPrice', 'updatePrice', 'deletePrice');
    mockDialogService = createMockService('openConfirmationDialog');
    mockBottomSheetService = createMockService('openBottomSubmenu');  
    mockMatDialog = createMockService('open');

    setup();
  });

  it('should initialize', () => {
    validateState();
  });

  describe('dispatching createPrice', () => {
    it('should open dialog and dispatch if submitted', () => {
      const priceRequest = testDataFactory.price.request();
      
      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of(priceRequest),
      } as MatDialogRef<any>);

      dispatcher.dispatch(priceEvents.createPrice()); 

      validateFunctionCall(mockMatDialog.functions.open, PriceDialog, {
        disableClose: true,
      });
      validateDispatcher(dispatchSpy, priceApiEvents.createPriceInitiated(priceRequest));
      validateState();
    });

    it('should open dialog and not dispatch anything if cancelled', () => {    
      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of(undefined),
      } as MatDialogRef<any>);

      dispatcher.dispatch(priceEvents.createPrice()); 

      validateFunctionCall(mockMatDialog.functions.open, PriceDialog, {
        disableClose: true,
      });
      validateDispatcher(dispatchSpy);
      validateState();
    });
  });

  describe('dispatching updatePrice', () => {
    const priceId = testDataFactory.price.id();
    const priceRequest = testDataFactory.price.request();
    it('should open dialog and dispatch if submitted', () => {
      
      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of(priceRequest),
      } as MatDialogRef<any>);

      dispatcher.dispatch(priceEvents.updatePrice({
        priceId,
        ...priceRequest,
      })); 

      validateFunctionCall(mockMatDialog.functions.open, PriceDialog, {
        disableClose: true,
        data: {
          priceId,
          ...priceRequest,
        },
      });
      validateDispatcher(dispatchSpy, priceApiEvents.updatePriceInitiated({
        ...priceRequest,
        priceId,
      }));
      validateState();
    });

    it('should open dialog and not dispatch anything if cancelled', () => {    
      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of(undefined),
      } as MatDialogRef<any>);

      dispatcher.dispatch(priceEvents.updatePrice({
        priceId,
        ...priceRequest,
      })); 

      validateFunctionCall(mockMatDialog.functions.open, PriceDialog, {
        disableClose: true,
        data: {
          priceId,
          ...priceRequest,
        },
      });
      validateDispatcher(dispatchSpy);
      validateState();
    });
  });

  describe('dispatching deletePrice', () => {
    const priceResponse = testDataFactory.price.response();
    it('should open dialog and dispatch if confirmed', () => {
      mockDialogService.functions.openConfirmationDialog.mockReturnValue(of(true));

      dispatcher.dispatch(priceEvents.deletePrice(priceResponse)); 

      validateFunctionCall(mockDialogService.functions.openConfirmationDialog, {
        title: 'Törölni akarod ezt a tételt az árlistából?',
        content: priceResponse.name,
      });
      validateDispatcher(dispatchSpy, priceApiEvents.deletePriceInitiated({
        priceId: priceResponse.priceId,
      }));
      validateState();
    });

    it('should open dialog and not dispatch anything if cancelled', () => {    
      mockDialogService.functions.openConfirmationDialog.mockReturnValue(of(false));

      dispatcher.dispatch(priceEvents.deletePrice(priceResponse)); 

      validateFunctionCall(mockDialogService.functions.openConfirmationDialog, {
        title: 'Törölni akarod ezt a tételt az árlistából?',
        content: priceResponse.name,
      });
      validateDispatcher(dispatchSpy);
      validateState();
    });
  });

  describe('dispatching openPriceListItemSubmenu', () => {
    const priceResponse = testDataFactory.price.response();
    it('should open bottom sheet and dispatch if edit is selected', () => {
      mockBottomSheetService.functions.openBottomSubmenu.mockReturnValue({
        afterDismissed: () => of('edit'),
      } as MatBottomSheetRef);

      dispatcher.dispatch(priceEvents.openPriceListItemSubmenu(priceResponse)); 

      validateFunctionCall(mockBottomSheetService.functions.openBottomSubmenu, priceResponse.name, 'edit', 'delete');
      validateDispatcher(dispatchSpy, priceEvents.updatePrice(priceResponse));
      validateState();
    });

    it('should open bottom sheet and dispatch if delete is selected', () => {
      mockBottomSheetService.functions.openBottomSubmenu.mockReturnValue({
        afterDismissed: () => of('delete'),
      } as MatBottomSheetRef);

      dispatcher.dispatch(priceEvents.openPriceListItemSubmenu(priceResponse)); 

      validateFunctionCall(mockBottomSheetService.functions.openBottomSubmenu, priceResponse.name, 'edit', 'delete');
      validateDispatcher(dispatchSpy, priceEvents.deletePrice(priceResponse));
      validateState();
    });

    it('should open bottom sheet and not dispatch anything if cancelled', () => {
      mockBottomSheetService.functions.openBottomSubmenu.mockReturnValue({
        afterDismissed: () => of(undefined),
      } as MatBottomSheetRef);

      dispatcher.dispatch(priceEvents.openPriceListItemSubmenu(priceResponse)); 

      validateFunctionCall(mockBottomSheetService.functions.openBottomSubmenu, priceResponse.name, 'edit', 'delete');
      validateDispatcher(dispatchSpy);
      validateState();
    });
  });
  
  describe('dispatching listPricesInitiated', () => {
    it('should call API and dispatch response', () => {
      const priceList = [testDataFactory.price.response()];
      mockPriceService.functions.listPrices.mockReturnValue(of(priceList));

      dispatcher.dispatch(priceApiEvents.listPricesInitiated());

      expect(mockPriceService.functions.listPrices).toHaveBeenCalled();
      validateDispatcher(dispatchSpy, priceApiEvents.listPricesCompleted(priceList));
      validateState();
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
      validateState();
    });
  });

  describe('dispatching listPricesCompleted', () => {
    it('should update store', () => {
      const name = 'ékezetes név';
      const priceResponse = testDataFactory.price.response({
        name,
      });

      dispatcher.dispatch(priceApiEvents.listPricesCompleted([priceResponse]));
      
      validateDispatcher(dispatchSpy);    
      validateState({
        priceList: [
          {
            ...priceResponse,
            searchTerms: expect.arrayContaining([
              'ekezetes',
              'nev',
              'ékezetes',
              'név',
            ]),
          },
        ],
      });
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
      validateState();
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
      validateState();
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
      validateState();
    });
  });

  describe('dispatching createPriceCompleted', () => {
    it('should update store', () => {
      const name = 'ékezetes név';
      const priceId = testDataFactory.price.id();
      const priceRequest = testDataFactory.price.request({
        name,
      });

      dispatcher.dispatch(priceApiEvents.createPriceCompleted({
        priceId,
        ...priceRequest,
      }));

      validateDispatcher(dispatchSpy);
      validateState({
        priceList: [
          {
            priceId,
            ...priceRequest,
            searchTerms: expect.arrayContaining([
              'ekezetes',
              'nev',
              'ékezetes',
              'név',
            ]),
          },
        ],
      });
    });
  });

  describe('dispatching updatePriceInitiated', () => {
    let priceRequest: Price.Request;
    let priceId: Price.Id;
    let originalPrice: Price.Response;

    beforeEach(() => {
      priceRequest = testDataFactory.price.request();
      originalPrice = testDataFactory.price.response();
      priceId = originalPrice.priceId;

      setup({
        priceList: [originalPrice],
      });
    });

    it('should call API and dispatch response', () => {
      mockPriceService.functions.updatePrice.mockReturnValue(of({
        priceId,
      }));

      dispatcher.dispatch(priceApiEvents.updatePriceInitiated({
        priceId,
        ...priceRequest, 
      }));

      validateFunctionCall(mockPriceService.functions.updatePrice, priceId, priceRequest);
      validateDispatcher(dispatchSpy, priceApiEvents.updatePriceCompleted({
        priceId,
        ...priceRequest, 
      }));
      validateState({
        isInProgress: [priceId],
      });
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
      
      validateDispatcher(dispatchSpy, priceApiEvents.updatePriceFailed({
        priceId,
      }), notificationEvents.showMessage(`Árlista elem (${priceRequest.name}) már létezik!`));
      validateState({
        isInProgress: [priceId],
      });

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
      validateState({
        isInProgress: [priceId],
      });
    });
  });

  describe('dispatching updatePriceCompleted', () => {
    it('should update store', () => {
      const originalPrice = testDataFactory.price.response();
      setup({
        isInProgress: [originalPrice.priceId],
        priceList: [originalPrice],
      });

      const name = 'ékezetes név';
      const priceRequest = testDataFactory.price.request({
        name,
      });

      dispatcher.dispatch(priceApiEvents.updatePriceCompleted({
        priceId: originalPrice.priceId,
        ...priceRequest,
      }));

      validateDispatcher(dispatchSpy);
      validateState({
        isInProgress: [],
        priceList: [
          {
            priceId: originalPrice.priceId,
            ...priceRequest,
            searchTerms: expect.arrayContaining([
              'ekezetes',
              'nev',
              'ékezetes',
              'név',
            ]),
          },
        ],
      });
    });
  });

  describe('dispatching updatePriceFailed', () => {
    it('should update store', () => {
      const originalPrice = testDataFactory.price.response();
      setup({
        isInProgress: [originalPrice.priceId],
        priceList: [originalPrice],
      });

      dispatcher.dispatch(priceApiEvents.updatePriceFailed({
        priceId: originalPrice.priceId,
      }));

      validateDispatcher(dispatchSpy);
      validateState({
        isInProgress: [],
      });
    });
  });

  describe('dispatching deletePriceInitiated', () => {
    let originalPrice: Price.Response;
    let priceId: Price.Id;
    
    beforeEach(() => {
      originalPrice = testDataFactory.price.response();
      priceId = originalPrice.priceId;

      setup({
        priceList: [originalPrice],
      });
    });

    it('should call API and dispatch response', () => {
      mockPriceService.functions.deletePrice.mockReturnValue(of({
        priceId,
      }));

      dispatcher.dispatch(priceApiEvents.deletePriceInitiated({
        priceId, 
      }));

      validateFunctionCall(mockPriceService.functions.deletePrice, priceId);
      validateDispatcher(dispatchSpy, priceApiEvents.deletePriceCompleted({
        priceId,
      }));
      validateState({
        isInProgress: [priceId],
      });
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
      validateState({
        isInProgress: [priceId],
      });
    });
  });

  describe('dispatching deletePriceCompleted', () => {
    it('should update store', () => {
      const originalPrice = testDataFactory.price.response();
      setup({
        isInProgress: [originalPrice.priceId],
        priceList: [originalPrice],
      });
      const priceRequest = testDataFactory.price.request();

      dispatcher.dispatch(priceApiEvents.deletePriceCompleted({
        priceId: originalPrice.priceId,
        ...priceRequest,
      }));

      validateDispatcher(dispatchSpy);
      validateState({
        isInProgress: [],
        priceList: [],
      });
    });
  });

  describe('dispatching deletePriceFailed', () => {
    it('should update store', () => {
      const originalPrice = testDataFactory.price.response();
      setup({
        isInProgress: [originalPrice.priceId],
        priceList: [originalPrice],
      });

      dispatcher.dispatch(priceApiEvents.deletePriceFailed({
        priceId: originalPrice.priceId,
      }));

      validateDispatcher(dispatchSpy);
      validateState({
        isInProgress: [],
      });
    });
  });
});
