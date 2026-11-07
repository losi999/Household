import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PriceService } from '@hairdressing/services/price-service';
import { priceApiEvents, priceEvents } from '@hairdressing/state/price/price-events';
import { PriceState, PriceStore, providePriceStoreInitialState } from '@hairdressing/state/price/price-store';
import { BottomSheetService, DialogService } from '@household/shared-ui';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { createMockService, MockService } from '@household/shared/common/unit-testing';
import { toSearchable } from '@household/shared/common/utils';
import { Dispatcher } from '@ngrx/signals/events';
import { of } from 'rxjs';

// The behavior of each store feature is covered in its own spec (with-price-reducer.spec.ts,
// with-price-events.spec.ts, with-price-api-events.spec.ts). This spec only verifies that the store
// provides its initial state and has every feature wired in.
describe('Price store', () => {
  let initialState: PriceState;
  let store: InstanceType<typeof PriceStore>;
  let dispatcher: Dispatcher;
  let mockPriceService: MockService<PriceService>;
  let mockDialogService: MockService<DialogService>;
  let mockMatDialog: MockService<MatDialog>;
  let mockBottomSheetService: MockService<BottomSheetService>;

  const setup = (initial?: Partial<PriceState>) => {
    TestBed.resetTestingModule();

    initialState = {
      isInProgress: [],
      priceList: [],
      ...initial,
    };

    mockPriceService = createMockService('listPrices', 'createPrice', 'updatePrice', 'deletePrice');
    mockDialogService = createMockService('openConfirmationDialog');
    mockBottomSheetService = createMockService('openBottomSubmenu');
    mockMatDialog = createMockService('open');

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
  };

  it('should initialize with the provided state', () => {
    const priceList = [toSearchable(testDataFactory.price.response(), ['name'])];
    const isInProgress = [testDataFactory.price.id()];

    setup({
      priceList,
      isInProgress,
    });

    expect(store.priceList()).toEqual(priceList);
    expect(store.isInProgress()).toEqual(isInProgress);
  });

  it('should initialize with the default state', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: PriceService,
          useValue: createMockService('listPrices').service,
        },
        {
          provide: MatDialog,
          useValue: createMockService('open').service,
        },
        {
          provide: DialogService,
          useValue: createMockService('openConfirmationDialog').service,
        },
        {
          provide: BottomSheetService,
          useValue: createMockService('openBottomSubmenu').service,
        },
        providePriceStoreInitialState(),
      ],
    });

    store = TestBed.inject(PriceStore);

    expect(store.priceList()).toEqual([]);
    expect(store.isInProgress()).toEqual([]);
  });

  it('should have the reducer wired in', () => {
    setup();
    const priceResponse = testDataFactory.price.response();

    dispatcher.dispatch(priceApiEvents.listPricesCompleted([priceResponse]));

    expect(store.priceList()).toEqual([toSearchable(priceResponse, ['name'])]);
  });

  it('should have the UI event handlers wired in', () => {
    setup();
    mockMatDialog.functions.open.mockReturnValue({
      afterClosed: () => of(undefined),
    } as MatDialogRef<any>);

    dispatcher.dispatch(priceEvents.createPrice());

    expect(mockMatDialog.functions.open).toHaveBeenCalledWith(expect.anything(), expect.anything());
  });

  it('should have the API event handlers and the reducer work together', () => {
    setup();
    const priceId = testDataFactory.price.id();
    const priceRequest = testDataFactory.price.request();
    mockPriceService.functions.createPrice.mockReturnValue(of({
      priceId,
    }));

    dispatcher.dispatch(priceApiEvents.createPriceInitiated(priceRequest));

    expect(mockPriceService.functions.createPrice).toHaveBeenCalledWith(priceRequest);
    expect(store.priceList()).toEqual([
      toSearchable({
        priceId,
        ...priceRequest,
      }, ['name']),
    ]);
  });
});
