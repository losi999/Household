import { TestBed } from '@angular/core/testing';
import { RecipientService } from '@household/services/recipient-service';
import { RecipientState, RecipientStore, provideRecipientStoreInitialState } from '@household/state/recipient/recipient-store';
import { BottomSheetService, DialogService } from '@household/shared-ui';
import { Dispatcher } from '@ngrx/signals/events';
import { createMockService, MockService } from '@household/shared/common/unit-testing';
import { MatDialog } from '@angular/material/dialog';
import { recipientApiEvents, recipientEvents } from '@household/state/recipient/recipient-events';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { of } from 'rxjs';
import { RecipientDialog } from '@household/app/recipient/recipient-dialog/recipient-dialog';

// The behavior of each store feature is covered in its own spec (with-recipient-reducer.spec.ts,
// with-recipient-events.spec.ts, with-recipient-api-events.spec.ts). This spec only verifies that the store
// provides its initial state and has every feature wired in.
describe('Recipient store', () => {
  let initialState: RecipientState;
  let store: InstanceType<typeof RecipientStore>;
  let dispatcher: Dispatcher;
  let mockRecipientService: MockService<RecipientService>;
  let mockDialogService: MockService<DialogService>;
  let mockMatDialog: MockService<MatDialog>;
  let mockBottomSheetService: MockService<BottomSheetService>;

  const setup = (initial?: Partial<RecipientState>) => {
    TestBed.resetTestingModule();

    initialState = {
      isInProgress: [],
      recipientList: [],
      ...initial,
    };

    mockRecipientService = createMockService('listRecipients', 'createRecipient', 'updateRecipient', 'deleteRecipient', 'mergeRecipients');
    mockDialogService = createMockService('openConfirmationDialog');
    mockBottomSheetService = createMockService('openBottomSubmenu');
    mockMatDialog = createMockService('open');

    TestBed.configureTestingModule({
      providers: [
        {
          provide: RecipientService,
          useValue: mockRecipientService.service,
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
        provideRecipientStoreInitialState(initialState),
      ],
    });

    store = TestBed.inject(RecipientStore);
    dispatcher = TestBed.inject(Dispatcher);
  };

  it('should initialize with the provided state', () => {
    const recipientList = [
      {
        ...testDataFactory.recipient.response(),
        searchTerms: ['term'],
      },
    ];
    const isInProgress = [testDataFactory.recipient.id()];

    setup({
      recipientList,
      isInProgress,
    });

    expect(store.recipientList()).toEqual(recipientList);
    expect(store.isInProgress()).toEqual(isInProgress);
  });

  it('should initialize with the default state', () => {
    setup();

    expect(store.recipientList()).toEqual([]);
    expect(store.isInProgress()).toEqual([]);
  });

  it('should have the reducer wired in', () => {
    setup();
    const recipientResponse = testDataFactory.recipient.response();

    dispatcher.dispatch(recipientApiEvents.listRecipientsCompleted([recipientResponse]));

    expect(store.recipientList()).toEqual([
      {
        ...recipientResponse,
        searchTerms: expect.any(Array),
      },
    ]);
  });

  it('should have the UI event handlers wired in', () => {
    setup();
    mockMatDialog.functions.open.mockReturnValue({
      afterClosed: () => of(undefined),
    } as any);

    dispatcher.dispatch(recipientEvents.createRecipient());

    expect(mockMatDialog.functions.open).toHaveBeenCalledWith(RecipientDialog, expect.anything());
  });

  it('should have the API event handlers and the reducer working together', () => {
    setup();
    const recipientRequest = testDataFactory.recipient.request();
    const recipientId = testDataFactory.recipient.id();
    mockRecipientService.functions.createRecipient.mockReturnValue(of({
      recipientId,
    }));

    dispatcher.dispatch(recipientApiEvents.createRecipientInitiated(recipientRequest));

    expect(mockRecipientService.functions.createRecipient).toHaveBeenCalledWith(recipientRequest);
    expect(store.recipientList()).toEqual([
      {
        recipientId,
        ...recipientRequest,
        searchTerms: expect.any(Array),
      },
    ]);
  });
});
