// The dialog classes the event handlers reference import the store, which imports the event handlers back.
// Loading the store first resolves that cycle in the same order as the application does.
import '@hairdressing/state/price/price-store';
import { TestBed } from '@angular/core/testing';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PriceDialog } from '@hairdressing/app/price/price-dialog/price-dialog';
import { priceApiEvents, priceEvents } from '@hairdressing/state/price/price-events';
import { withPriceEvents } from '@hairdressing/state/price/with-price-events';
import { BottomSheetService, createDispatcherSpy, DialogService, validateDispatcher } from '@household/shared-ui';
import { createMockService, MockService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { signalStore } from '@ngrx/signals';
import { Dispatcher } from '@ngrx/signals/events';
import { of } from 'rxjs';
import { Mock } from 'vitest';

describe('withPriceEvents', () => {
  let dispatcher: Dispatcher;
  let dispatchSpy: Mock;
  let mockDialogService: MockService<DialogService>;
  let mockMatDialog: MockService<MatDialog>;
  let mockBottomSheetService: MockService<BottomSheetService>;

  const setup = () => {
    TestBed.resetTestingModule();

    mockDialogService = createMockService('openConfirmationDialog');
    mockBottomSheetService = createMockService('openBottomSubmenu');
    mockMatDialog = createMockService('open');

    TestBed.configureTestingModule({
      providers: [
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
      ],
    });

    TestBed.inject(signalStore({
      providedIn: 'root',
    }, withPriceEvents()));
    dispatcher = TestBed.inject(Dispatcher);
    dispatchSpy = createDispatcherSpy(dispatcher);
  };

  beforeEach(() => {
    setup();
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
    });

    it('should open dialog and not dispatch anything if cancelled', () => {
      mockDialogService.functions.openConfirmationDialog.mockReturnValue(of(false));

      dispatcher.dispatch(priceEvents.deletePrice(priceResponse));

      validateFunctionCall(mockDialogService.functions.openConfirmationDialog, {
        title: 'Törölni akarod ezt a tételt az árlistából?',
        content: priceResponse.name,
      });
      validateDispatcher(dispatchSpy);
    });
  });

  describe('dispatching openPriceListItemSubmenu', () => {
    const priceResponse = testDataFactory.price.response();

    it('should open bottom sheet and dispatch if edit is selected', () => {
      mockBottomSheetService.functions.openBottomSubmenu.mockReturnValue({
        afterDismissed: () => of('edit'),
      } as MatBottomSheetRef);

      dispatcher.dispatch(priceEvents.openPriceListItemSubmenu(priceResponse));

      validateFunctionCall(mockBottomSheetService.functions.openBottomSubmenu, priceResponse.name, [
        BottomSheetService.Edit,
        BottomSheetService.Delete,
      ]);
      validateDispatcher(dispatchSpy, priceEvents.updatePrice(priceResponse));
    });

    it('should open bottom sheet and dispatch if delete is selected', () => {
      mockBottomSheetService.functions.openBottomSubmenu.mockReturnValue({
        afterDismissed: () => of('delete'),
      } as MatBottomSheetRef);

      dispatcher.dispatch(priceEvents.openPriceListItemSubmenu(priceResponse));

      validateFunctionCall(mockBottomSheetService.functions.openBottomSubmenu, priceResponse.name, [
        BottomSheetService.Edit,
        BottomSheetService.Delete,
      ]);
      validateDispatcher(dispatchSpy, priceEvents.deletePrice(priceResponse));
    });

    it('should open bottom sheet and not dispatch anything if cancelled', () => {
      mockBottomSheetService.functions.openBottomSubmenu.mockReturnValue({
        afterDismissed: () => of(undefined),
      } as MatBottomSheetRef);

      dispatcher.dispatch(priceEvents.openPriceListItemSubmenu(priceResponse));

      validateFunctionCall(mockBottomSheetService.functions.openBottomSubmenu, priceResponse.name, [
        BottomSheetService.Edit,
        BottomSheetService.Delete,
      ]);
      validateDispatcher(dispatchSpy);
    });
  });
});
