import { TestBed } from '@angular/core/testing';
import { PriceService } from '@hairdressing/services/price-service';
import { PriceState, PriceStore, providePriceStoreInitialState } from '@hairdressing/state/price/price-store';
import { BottomSheetService, createDispatcherSpy, DialogService, notificationEvents } from '@household/shared-ui';
import { Dispatcher } from '@ngrx/signals/events';
import { Mock } from 'vitest';
import { createMockService, MockService, validateFunctionCall, validateNthFunctionCall } from '@household/shared/common/unit-testing';
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
  let originalPrice: Price.Response;

  beforeEach(() => {
    mockPriceService = createMockService('listPrices', 'createPrice', 'updatePrice', 'deletePrice');
    mockDialogService = createMockService('openConfirmationDialog');
    mockBottomSheetService = createMockService('openBottomSubmenu');  
    mockMatDialog = createMockService('open');

    originalPrice = testDataFactory.price.response();
    initialState = {
      isInProgress: [originalPrice.priceId],
      priceList: [originalPrice],
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
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize', () => {
    expect(store.isInProgress()).toEqual(initialState.isInProgress);
    expect(store.priceList()).toEqual(initialState.priceList);
  });

  describe('dispatching createPrice', () => {
    it('should open the dialog and dispatch createPriceInitiated if submitted', () => {
      const priceRequest = testDataFactory.price.request();
      
      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of(priceRequest),
      } as MatDialogRef<any>);

      dispatcher.dispatch(priceEvents.createPrice()); 

      validateFunctionCall(mockMatDialog.functions.open, PriceDialog, {
        disableClose: true,
      });
      validateNthFunctionCall(dispatchSpy, 2, priceApiEvents.createPriceInitiated(priceRequest), undefined);
      expect(dispatchSpy).toHaveBeenCalledTimes(2);
      expect(store.isInProgress()).toEqual(initialState.isInProgress);
      expect(store.priceList()).toEqual(initialState.priceList);
    });

    it('should open the dialog and not dispatch anything if cancelled', () => {    
      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of(undefined),
      } as MatDialogRef<any>);

      dispatcher.dispatch(priceEvents.createPrice()); 

      validateFunctionCall(mockMatDialog.functions.open, PriceDialog, {
        disableClose: true,
      });
      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      expect(store.isInProgress()).toEqual(initialState.isInProgress);
      expect(store.priceList()).toEqual(initialState.priceList);
    });
  });

  describe('dispatching updatePrice', () => {
    const priceId = testDataFactory.price.id();
    const priceRequest = testDataFactory.price.request();
    it('should open the dialog and dispatch updatePriceInitiated if submitted', () => {
      
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
      validateNthFunctionCall(dispatchSpy, 2, priceApiEvents.updatePriceInitiated({
        ...priceRequest,
        priceId,
      }), undefined);
      expect(dispatchSpy).toHaveBeenCalledTimes(2);
      expect(store.isInProgress()).toEqual(initialState.isInProgress);
      expect(store.priceList()).toEqual(initialState.priceList);
    });

    it('should open the dialog and not dispatch anything if cancelled', () => {    
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
      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      expect(store.isInProgress()).toEqual(initialState.isInProgress);
      expect(store.priceList()).toEqual(initialState.priceList);
    });
  });

  describe('dispatching deletePrice', () => {
    const priceResponse = testDataFactory.price.response();
    it('should open the dialog and dispatch deletePriceInitiated if confirmed', () => {
      mockDialogService.functions.openConfirmationDialog.mockReturnValue(of(true));

      dispatcher.dispatch(priceEvents.deletePrice(priceResponse)); 

      validateFunctionCall(mockDialogService.functions.openConfirmationDialog, {
        title: 'Törölni akarod ezt a tételt az árlistából?',
        content: priceResponse.name,
      });
      validateNthFunctionCall(dispatchSpy, 2, priceApiEvents.deletePriceInitiated({
        priceId: priceResponse.priceId,
      }), undefined);
      expect(dispatchSpy).toHaveBeenCalledTimes(2);
      expect(store.isInProgress()).toEqual(initialState.isInProgress);
      expect(store.priceList()).toEqual(initialState.priceList);
    });

    it('should open the dialog and not dispatch anything if cancelled', () => {    
      mockDialogService.functions.openConfirmationDialog.mockReturnValue(of(false));

      dispatcher.dispatch(priceEvents.deletePrice(priceResponse)); 

      validateFunctionCall(mockDialogService.functions.openConfirmationDialog, {
        title: 'Törölni akarod ezt a tételt az árlistából?',
        content: priceResponse.name,
      });
      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      expect(store.isInProgress()).toEqual(initialState.isInProgress);
      expect(store.priceList()).toEqual(initialState.priceList);
    });
  });

  describe('dispatching openPriceListItemSubmenu', () => {
    const priceResponse = testDataFactory.price.response();
    it('should open bottom sheet and dispatch updatePrice if selected', () => {
      mockBottomSheetService.functions.openBottomSubmenu.mockReturnValue({
        afterDismissed: () => of('edit'),
      } as MatBottomSheetRef);

      dispatcher.dispatch(priceEvents.openPriceListItemSubmenu(priceResponse)); 

      validateFunctionCall(mockBottomSheetService.functions.openBottomSubmenu, priceResponse.name, 'edit', 'delete');
      validateNthFunctionCall(dispatchSpy, 2, priceEvents.updatePrice(priceResponse), undefined);
      expect(dispatchSpy).toHaveBeenCalledTimes(2);
      expect(store.isInProgress()).toEqual(initialState.isInProgress);
      expect(store.priceList()).toEqual(initialState.priceList);
    });

    it('should open bottom sheet and dispatch deletePrice if selected', () => {
      mockBottomSheetService.functions.openBottomSubmenu.mockReturnValue({
        afterDismissed: () => of('delete'),
      } as MatBottomSheetRef);

      dispatcher.dispatch(priceEvents.openPriceListItemSubmenu(priceResponse)); 

      validateFunctionCall(mockBottomSheetService.functions.openBottomSubmenu, priceResponse.name, 'edit', 'delete');
      validateNthFunctionCall(dispatchSpy, 2, priceEvents.deletePrice(priceResponse), undefined);
      expect(dispatchSpy).toHaveBeenCalledTimes(2);
      expect(store.isInProgress()).toEqual(initialState.isInProgress);
      expect(store.priceList()).toEqual(initialState.priceList);
    });

    it('should open bottom sheet and not dispatch anything if cancelled', () => {
      mockBottomSheetService.functions.openBottomSubmenu.mockReturnValue({
        afterDismissed: () => of(undefined),
      } as MatBottomSheetRef);

      dispatcher.dispatch(priceEvents.openPriceListItemSubmenu(priceResponse)); 

      validateFunctionCall(mockBottomSheetService.functions.openBottomSubmenu, priceResponse.name, 'edit', 'delete');
      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      expect(store.isInProgress()).toEqual(initialState.isInProgress);
      expect(store.priceList()).toEqual(initialState.priceList);
    });
  });
  
  describe('dispatching listPricesInitiated', () => {
    it('should call listPrices and dispatch listPricesCompleted', () => {
      const priceList = [testDataFactory.price.response()];
      mockPriceService.functions.listPrices.mockReturnValue(of(priceList));

      dispatcher.dispatch(priceApiEvents.listPricesInitiated());

      expect(mockPriceService.functions.listPrices).toHaveBeenCalled();
      validateNthFunctionCall(dispatchSpy, 2, priceApiEvents.listPricesCompleted(priceList), undefined);
      expect(dispatchSpy).toHaveBeenCalledTimes(2);
      expect(store.isInProgress()).toEqual(initialState.isInProgress);
      expect(store.priceList()).toEqual(initialState.priceList);
    });

    it('should call listPrices and show notification if there is an error', () => {
      mockPriceService.functions.listPrices.mockReturnValue(throwError(() => ({
        error: {
          message: 'There is an error',
        },
      })));

      dispatcher.dispatch(priceApiEvents.listPricesInitiated());

      expect(mockPriceService.functions.listPrices).toHaveBeenCalled();
      validateNthFunctionCall(dispatchSpy, 2, notificationEvents.showMessage('Hiba történt'), undefined);
      expect(dispatchSpy).toHaveBeenCalledTimes(2);
      expect(store.isInProgress()).toEqual(initialState.isInProgress);
      expect(store.priceList()).toEqual(initialState.priceList);
    });
  });

  describe('dispatching listPricesCompleted', () => {
    it('should update store', () => {
      const name = 'ékezetes név';
      const priceResponse = testDataFactory.price.response({
        name,
      });

      dispatcher.dispatch(priceApiEvents.listPricesCompleted([priceResponse]));
    
      expect(store.isInProgress()).toEqual(initialState.isInProgress);
      expect(store.priceList()).toContainEqual({
        ...priceResponse,
        searchTerms: expect.arrayContaining([
          'ekezetes',
          'nev',
          'ékezetes',
          'név',
        ]),
      });
    });
  });

  describe('dispatching createPriceInitiated', () => {
    const priceRequest = testDataFactory.price.request();
    const priceId = testDataFactory.price.id();

    it('should call createPrice and dispatch createPriceCompleted', () => {
      mockPriceService.functions.createPrice.mockReturnValue(of({
        priceId,
      }));

      dispatcher.dispatch(priceApiEvents.createPriceInitiated(priceRequest));

      validateFunctionCall(mockPriceService.functions.createPrice, priceRequest);
      validateNthFunctionCall(dispatchSpy, 2, priceApiEvents.createPriceCompleted({
        priceId,
        ...priceRequest, 
      }), undefined);
      expect(dispatchSpy).toHaveBeenCalledTimes(2);
      expect(store.isInProgress()).toEqual(initialState.isInProgress);
      expect(store.priceList()).toEqual(initialState.priceList);
    });

    it('should call createPrice and show notification if price name is already taken', () => {
      mockPriceService.functions.createPrice.mockReturnValue(throwError(() => ({
        error: {
          message: 'Duplicate price name',
        },
      })));

      dispatcher.dispatch(priceApiEvents.createPriceInitiated(priceRequest));

      validateFunctionCall(mockPriceService.functions.createPrice, priceRequest);
      validateNthFunctionCall(dispatchSpy, 2, notificationEvents.showMessage(`Árlista elem (${priceRequest.name}) már létezik!`), undefined);
      expect(dispatchSpy).toHaveBeenCalledTimes(2);
      expect(store.isInProgress()).toEqual(initialState.isInProgress);
      expect(store.priceList()).toEqual(initialState.priceList);
    });

    it('should call createPrice and show notification if there is an error', () => {
      mockPriceService.functions.createPrice.mockReturnValue(throwError(() => ({
        error: {
          message: 'There is an error',
        },
      })));

      dispatcher.dispatch(priceApiEvents.createPriceInitiated(priceRequest));

      validateFunctionCall(mockPriceService.functions.createPrice, priceRequest);
      validateNthFunctionCall(dispatchSpy, 2, notificationEvents.showMessage('Hiba történt'), undefined);
      expect(dispatchSpy).toHaveBeenCalledTimes(2);
      expect(store.isInProgress()).toEqual(initialState.isInProgress);
      expect(store.priceList()).toEqual(initialState.priceList);
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

      expect(store.isInProgress()).toEqual(initialState.isInProgress);
      expect(store.priceList()).toContainEqual({
        priceId,
        ...priceRequest,
        searchTerms: expect.arrayContaining([
          'ekezetes',
          'nev',
          'ékezetes',
          'név',
        ]),
      });
    });
  });

  describe('dispatching updatePriceInitiated', () => {
    const priceRequest = testDataFactory.price.request();
    const priceId = testDataFactory.price.id();

    it('should call updatePrice and dispatch updatePriceCompleted', () => {
      mockPriceService.functions.updatePrice.mockReturnValue(of({
        priceId,
      }));

      dispatcher.dispatch(priceApiEvents.updatePriceInitiated({
        priceId,
        ...priceRequest, 
      }));

      validateFunctionCall(mockPriceService.functions.updatePrice, priceId, priceRequest);
      validateNthFunctionCall(dispatchSpy, 2, priceApiEvents.updatePriceCompleted({
        priceId,
        ...priceRequest, 
      }), undefined);
      expect(dispatchSpy).toHaveBeenCalledTimes(2);
    });

    it('should call updatePrice and show notification if price name is already taken', () => {
      mockPriceService.functions.updatePrice.mockReturnValue(throwError(() => ({
        error: {
          message: 'Duplicate price name',
        },
      })));

      dispatcher.dispatch(priceApiEvents.updatePriceInitiated({
        priceId,
        ...priceRequest, 
      }));
      
      validateNthFunctionCall(dispatchSpy, 2, priceApiEvents.updatePriceFailed({
        priceId,
      }), undefined);
      validateNthFunctionCall(dispatchSpy, 3, notificationEvents.showMessage(`Árlista elem (${priceRequest.name}) már létezik!`), undefined);
      expect(dispatchSpy).toHaveBeenCalledTimes(3);

    });

    it('should call updatePrice and show notification if there is an error', () => {
      mockPriceService.functions.updatePrice.mockReturnValue(throwError(() => ({
        error: {
          message: 'There is an error',
        },
      })));

      dispatcher.dispatch(priceApiEvents.updatePriceInitiated({
        priceId,
        ...priceRequest, 
      }));

      validateNthFunctionCall(dispatchSpy, 2, priceApiEvents.updatePriceFailed({
        priceId,
      }), undefined);
      validateFunctionCall(mockPriceService.functions.updatePrice, priceId, priceRequest);
      validateNthFunctionCall(dispatchSpy, 3, notificationEvents.showMessage('Hiba történt'), undefined);
      expect(dispatchSpy).toHaveBeenCalledTimes(3);
    });

    it('should update store', () => {
      mockPriceService.functions.updatePrice.mockReturnValue(of({
        priceId,
      }));

      dispatcher.dispatch(priceApiEvents.updatePriceInitiated({
        priceId,
        ...priceRequest, 
      }));

      expect(store.isInProgress()).toContain(priceId);
      expect(store.priceList()).toEqual(initialState.priceList);
    });
  });

  describe('dispatching updatePriceCompleted', () => {
    it('should update store', () => {
      const name = 'ékezetes név';
      const priceRequest = testDataFactory.price.request({
        name,
      });

      dispatcher.dispatch(priceApiEvents.updatePriceCompleted({
        priceId: originalPrice.priceId,
        ...priceRequest,
      }));

      expect(store.isInProgress()).toEqual([]);
      expect(store.priceList()).toContainEqual({
        priceId: originalPrice.priceId,
        ...priceRequest,
        searchTerms: expect.arrayContaining([
          'ekezetes',
          'nev',
          'ékezetes',
          'név',
        ]),
      });
    });
  });

  describe('dispatching updatePriceFailed', () => {
    it('should update store', () => {
      const priceId = testDataFactory.price.id();

      dispatcher.dispatch(priceApiEvents.updatePriceFailed({
        priceId,
      }));

      expect(store.priceList()).toEqual(initialState.priceList);
      expect(store.isInProgress()).not.toContain(priceId);
    });
  });

  describe('dispatching deletePriceInitiated', () => {
    const priceId = testDataFactory.price.id();

    it('should call deletePrice and dispatch deletePriceCompleted', () => {
      mockPriceService.functions.deletePrice.mockReturnValue(of({
        priceId,
      }));

      dispatcher.dispatch(priceApiEvents.deletePriceInitiated({
        priceId, 
      }));

      validateFunctionCall(mockPriceService.functions.deletePrice, priceId);
      validateNthFunctionCall(dispatchSpy, 2, priceApiEvents.deletePriceCompleted({
        priceId,
      }), undefined);
      expect(dispatchSpy).toHaveBeenCalledTimes(2);
    });

    it('should call deletePrice and show notification if there is an error', () => {
      mockPriceService.functions.deletePrice.mockReturnValue(throwError(() => ({
        error: {
          message: 'There is an error',
        },
      })));

      dispatcher.dispatch(priceApiEvents.deletePriceInitiated({
        priceId, 
      }));

      validateFunctionCall(mockPriceService.functions.deletePrice, priceId);
      validateNthFunctionCall(dispatchSpy, 2, priceApiEvents.deletePriceFailed({
        priceId,
      }), undefined);
      validateNthFunctionCall(dispatchSpy, 3, notificationEvents.showMessage('Hiba történt'), undefined);
      expect(dispatchSpy).toHaveBeenCalledTimes(3);
    });

    it('should update store', () => {
      mockPriceService.functions.deletePrice.mockReturnValue(of({
        priceId,
      }));
      
      dispatcher.dispatch(priceApiEvents.deletePriceInitiated({
        priceId, 
      }));

      expect(store.isInProgress()).toContain(priceId);
      expect(store.priceList()).toEqual(initialState.priceList);
    });
  });

  describe('dispatching deletePriceCompleted', () => {
    it('should update store', () => {
      const priceRequest = testDataFactory.price.request();

      dispatcher.dispatch(priceApiEvents.deletePriceCompleted({
        priceId: originalPrice.priceId,
        ...priceRequest,
      }));

      expect(store.isInProgress()).toEqual([]);
      expect(store.priceList()).toEqual([]);
    });
  });

  describe('dispatching deletePriceFailed', () => {
    it('should update store', () => {
      const priceId = testDataFactory.price.id();

      dispatcher.dispatch(priceApiEvents.deletePriceFailed({
        priceId,
      }));

      expect(store.priceList()).toEqual(initialState.priceList);
      expect(store.isInProgress()).not.toContain(priceId);
    });
  });
});
  
