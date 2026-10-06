import { TestBed } from '@angular/core/testing';
import { RecipientService } from '@household/services/recipient-service';
import { RecipientState, RecipientStore, provideRecipientStoreInitialState } from '@household/state/recipient/recipient-store';
import { BottomSheetService, createDispatcherSpy, DialogService, notificationEvents, validateDispatcher } from '@household/shared-ui';
import { Dispatcher } from '@ngrx/signals/events';
import { Mock } from 'vitest';
import { createMockService, MockService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { recipientApiEvents, recipientEvents } from '@household/state/recipient/recipient-events';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { of, throwError } from 'rxjs';
import { RecipientDialog } from '@household/app/recipient/recipient-dialog/recipient-dialog';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { Api } from '@household/shared/types/api';
import { Requests } from '@household/shared/types/requests';
import { Responses } from '@household/shared/types/responses';
import { RecipientMergeDialog } from '@household/app/recipient/recipient-merge-dialog/recipient-merge-dialog';

describe('Recipient store', () => {
  let initialState: RecipientState; 
  let store: InstanceType<typeof RecipientStore>;
  let dispatcher: Dispatcher;
  let dispatchSpy: Mock;
  let mockRecipientService: MockService<RecipientService>;
  let mockDialogService: MockService<DialogService>;
  let mockMatDialog: MockService<MatDialog>;
  let mockBottomSheetService: MockService<BottomSheetService>;

  const validateState = (currentValue?: Partial<RecipientState>) => {
    expect(store.isInProgress(), 'isInProgress').toEqual(currentValue?.isInProgress ?? initialState.isInProgress);
    expect(store.recipientList(), 'recipientList').toEqual(currentValue?.recipientList ?? initialState.recipientList);
  };

  const setup = (initial?: Partial<RecipientState>) => {
    TestBed.resetTestingModule();
    initialState = {
      isInProgress: [],
      recipientList: [],
      ...initial,
    };

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
    dispatchSpy = createDispatcherSpy(dispatcher);
  };

  beforeEach(() => {
    mockRecipientService = createMockService('listRecipients', 'createRecipient', 'updateRecipient', 'deleteRecipient', 'mergeRecipients');
    mockDialogService = createMockService('openConfirmationDialog');
    mockBottomSheetService = createMockService('openBottomSubmenu');  
    mockMatDialog = createMockService('open');

    setup();
  });

  it('should initialize', () => {
    validateState();
  });

  describe('dispatching createRecipient', () => {
    it('should open dialog and dispatch if submitted', () => {
      const recipientRequest = testDataFactory.recipient.request();
      
      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of(recipientRequest),
      } as MatDialogRef<any>);

      dispatcher.dispatch(recipientEvents.createRecipient()); 

      validateFunctionCall(mockMatDialog.functions.open, RecipientDialog, {
        disableClose: true,
      });
      validateDispatcher(dispatchSpy, recipientApiEvents.createRecipientInitiated(recipientRequest));
      validateState();
    });

    it('should open dialog and not dispatch anything if cancelled', () => {    
      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of(undefined),
      } as MatDialogRef<any>);

      dispatcher.dispatch(recipientEvents.createRecipient()); 

      validateFunctionCall(mockMatDialog.functions.open, RecipientDialog, {
        disableClose: true,
      });
      validateDispatcher(dispatchSpy);
      validateState();
    });
  });

  describe('dispatching updateRecipient', () => {
    const recipientId = testDataFactory.recipient.id();
    const recipientRequest = testDataFactory.recipient.request();
    it('should open dialog and dispatch if submitted', () => {
      
      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of(recipientRequest),
      } as MatDialogRef<any>);

      dispatcher.dispatch(recipientEvents.updateRecipient({
        recipientId,
        ...recipientRequest,
      })); 

      validateFunctionCall(mockMatDialog.functions.open, RecipientDialog, {
        disableClose: true,
        data: {
          recipientId,
          ...recipientRequest,
        },
      });
      validateDispatcher(dispatchSpy, recipientApiEvents.updateRecipientInitiated({
        ...recipientRequest,
        recipientId,
      }));
      validateState();
    });

    it('should open dialog and not dispatch anything if cancelled', () => {    
      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of(undefined),
      } as MatDialogRef<any>);

      dispatcher.dispatch(recipientEvents.updateRecipient({
        recipientId,
        ...recipientRequest,
      })); 

      validateFunctionCall(mockMatDialog.functions.open, RecipientDialog, {
        disableClose: true,
        data: {
          recipientId,
          ...recipientRequest,
        },
      });
      validateDispatcher(dispatchSpy);
      validateState();
    });
  });

  describe('dispatching deleteRecipient', () => {
    const recipientResponse = testDataFactory.recipient.response();
    it('should open dialog and dispatch if confirmed', () => {
      mockDialogService.functions.openConfirmationDialog.mockReturnValue(of(true));

      dispatcher.dispatch(recipientEvents.deleteRecipient(recipientResponse)); 

      validateFunctionCall(mockDialogService.functions.openConfirmationDialog, {
        title: 'Törölni akarod ezt a partnert?',
        content: recipientResponse.name,
      });
      validateDispatcher(dispatchSpy, recipientApiEvents.deleteRecipientInitiated({
        recipientId: recipientResponse.recipientId,
      }));
      validateState();
    });

    it('should open dialog and not dispatch anything if cancelled', () => {    
      mockDialogService.functions.openConfirmationDialog.mockReturnValue(of(false));

      dispatcher.dispatch(recipientEvents.deleteRecipient(recipientResponse)); 

      validateFunctionCall(mockDialogService.functions.openConfirmationDialog, {
        title: 'Törölni akarod ezt a partnert?',
        content: recipientResponse.name,
      });
      validateDispatcher(dispatchSpy);
      validateState();
    });
  });

  describe('dispatching mergeRecipients', () => {    
    const recipientResponse = testDataFactory.recipient.response();
    const sourceRecipientId = testDataFactory.recipient.id();
    it('should open dialog and dispatch if submitted', () => {
      
      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of({
          sourceRecipientIds: [sourceRecipientId],
          targetRecipientId: recipientResponse.recipientId,
        }),
      } as MatDialogRef<any>);

      dispatcher.dispatch(recipientEvents.mergeRecipients(recipientResponse)); 

      validateFunctionCall(mockMatDialog.functions.open, RecipientMergeDialog, {
        disableClose: true,
        data: recipientResponse,
        height: '80vh',
        width: '90vw',
      });
      validateDispatcher(dispatchSpy, recipientApiEvents.mergeRecipientsInitiated({
        sourceRecipientIds: [sourceRecipientId],
        targetRecipientId: recipientResponse.recipientId,
      }));
      validateState();
    });

    it('should open dialog and not dispatch anything if cancelled', () => {    
      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of(undefined),
      } as MatDialogRef<any>);

      dispatcher.dispatch(recipientEvents.mergeRecipients(recipientResponse)); 

      validateFunctionCall(mockMatDialog.functions.open, RecipientMergeDialog, {
        disableClose: true,
        data: recipientResponse,
        height: '80vh',
        width: '90vw',
      });
      validateDispatcher(dispatchSpy);
      validateState();
    });
  });

  describe('dispatching openRecipientListItemSubmenu', () => {
    const recipientResponse = testDataFactory.recipient.response();
    it('should open bottom sheet and dispatch if edit is selected', () => {
      mockBottomSheetService.functions.openBottomSubmenu.mockReturnValue({
        afterDismissed: () => of('edit'),
      } as MatBottomSheetRef);

      dispatcher.dispatch(recipientEvents.openRecipientListItemSubmenu(recipientResponse)); 

      validateFunctionCall(mockBottomSheetService.functions.openBottomSubmenu, recipientResponse.name, 'edit', 'merge', 'delete');
      validateDispatcher(dispatchSpy, recipientEvents.updateRecipient(recipientResponse));
      validateState();
    });

    it('should open bottom sheet and dispatch if merge is selected', () => {
      mockBottomSheetService.functions.openBottomSubmenu.mockReturnValue({
        afterDismissed: () => of('merge'),
      } as MatBottomSheetRef);

      dispatcher.dispatch(recipientEvents.openRecipientListItemSubmenu(recipientResponse)); 

      validateFunctionCall(mockBottomSheetService.functions.openBottomSubmenu, recipientResponse.name, 'edit', 'merge', 'delete');
      validateDispatcher(dispatchSpy, recipientEvents.mergeRecipients(recipientResponse));
      validateState();
    });

    it('should open bottom sheet and dispatch if delete is selected', () => {
      mockBottomSheetService.functions.openBottomSubmenu.mockReturnValue({
        afterDismissed: () => of('delete'),
      } as MatBottomSheetRef);

      dispatcher.dispatch(recipientEvents.openRecipientListItemSubmenu(recipientResponse)); 

      validateFunctionCall(mockBottomSheetService.functions.openBottomSubmenu, recipientResponse.name, 'edit', 'merge', 'delete');
      validateDispatcher(dispatchSpy, recipientEvents.deleteRecipient(recipientResponse));
      validateState();
    });

    it('should open bottom sheet and not dispatch anything if cancelled', () => {
      mockBottomSheetService.functions.openBottomSubmenu.mockReturnValue({
        afterDismissed: () => of(undefined),
      } as MatBottomSheetRef);

      dispatcher.dispatch(recipientEvents.openRecipientListItemSubmenu(recipientResponse)); 

      validateFunctionCall(mockBottomSheetService.functions.openBottomSubmenu, recipientResponse.name, 'edit', 'merge', 'delete');
      validateDispatcher(dispatchSpy);
      validateState();
    });
  });
  
  describe('dispatching listRecipientsInitiated', () => {
    it('should call API and dispatch response', () => {
      const recipientList = [testDataFactory.recipient.response()];
      mockRecipientService.functions.listRecipients.mockReturnValue(of(recipientList));

      dispatcher.dispatch(recipientApiEvents.listRecipientsInitiated());

      expect(mockRecipientService.functions.listRecipients).toHaveBeenCalled();
      validateDispatcher(dispatchSpy, recipientApiEvents.listRecipientsCompleted(recipientList));
      validateState();
    });

    it('should call API and show notification if there is an error', () => {
      mockRecipientService.functions.listRecipients.mockReturnValue(throwError(() => ({
        error: {
          message: 'There is an error',
        },
      })));

      dispatcher.dispatch(recipientApiEvents.listRecipientsInitiated());

      expect(mockRecipientService.functions.listRecipients).toHaveBeenCalled();
      validateDispatcher(dispatchSpy, notificationEvents.showMessage('Hiba történt'));
      validateState();
    });
  });

  describe('dispatching listRecipientsCompleted', () => {
    it('should update store', () => {
      const name = 'ékezetes név';
      const recipientResponse = testDataFactory.recipient.response({
        name,
      });

      dispatcher.dispatch(recipientApiEvents.listRecipientsCompleted([recipientResponse]));
      
      validateDispatcher(dispatchSpy);    
      validateState({
        recipientList: [
          {
            ...recipientResponse,
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

  describe('dispatching createRecipientInitiated', () => {
    const recipientRequest = testDataFactory.recipient.request();
    const recipientId = testDataFactory.recipient.id();

    it('should call API and dispatch response', () => {
      mockRecipientService.functions.createRecipient.mockReturnValue(of({
        recipientId,
      }));

      dispatcher.dispatch(recipientApiEvents.createRecipientInitiated(recipientRequest));

      validateFunctionCall(mockRecipientService.functions.createRecipient, recipientRequest);
      validateDispatcher(dispatchSpy, recipientApiEvents.createRecipientCompleted({
        recipientId,
        ...recipientRequest, 
      }));
      validateState();
    });

    it('should call API and show notification if recipient name is already taken', () => {
      mockRecipientService.functions.createRecipient.mockReturnValue(throwError(() => ({
        error: {
          message: 'Duplicate recipient name',
        },
      })));

      dispatcher.dispatch(recipientApiEvents.createRecipientInitiated(recipientRequest));

      validateFunctionCall(mockRecipientService.functions.createRecipient, recipientRequest);
      validateDispatcher(dispatchSpy, notificationEvents.showMessage(`Partner (${recipientRequest.name}) már létezik!`));
      validateState();
    });

    it('should call API and show notification if there is an error', () => {
      mockRecipientService.functions.createRecipient.mockReturnValue(throwError(() => ({
        error: {
          message: 'There is an error',
        },
      })));

      dispatcher.dispatch(recipientApiEvents.createRecipientInitiated(recipientRequest));

      validateFunctionCall(mockRecipientService.functions.createRecipient, recipientRequest);
      validateDispatcher(dispatchSpy, notificationEvents.showMessage('Hiba történt'));
      validateState();
    });
  });

  describe('dispatching createRecipientCompleted', () => {
    it('should update store', () => {
      const name = 'ékezetes név';
      const recipientId = testDataFactory.recipient.id();
      const recipientRequest = testDataFactory.recipient.request({
        name,
      });

      dispatcher.dispatch(recipientApiEvents.createRecipientCompleted({
        recipientId,
        ...recipientRequest,
      }));

      validateDispatcher(dispatchSpy);
      validateState({
        recipientList: [
          {
            recipientId,
            ...recipientRequest,
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

  describe('dispatching updateRecipientInitiated', () => {
    let recipientRequest: Requests.Recipient;
    let recipientId: Api.Recipient.Id;
    let originalRecipient: Responses.Recipient;

    beforeEach(() => {
      recipientRequest = testDataFactory.recipient.request();
      originalRecipient = testDataFactory.recipient.response();
      recipientId = originalRecipient.recipientId;

      setup({
        recipientList: [originalRecipient],
      });
    });

    it('should call API and dispatch response', () => {
      mockRecipientService.functions.updateRecipient.mockReturnValue(of(undefined));

      dispatcher.dispatch(recipientApiEvents.updateRecipientInitiated({
        recipientId,
        ...recipientRequest, 
      }));

      validateFunctionCall(mockRecipientService.functions.updateRecipient, recipientId, recipientRequest);
      validateDispatcher(dispatchSpy, recipientApiEvents.updateRecipientCompleted({
        recipientId,
        ...recipientRequest, 
      }));
      validateState({
        isInProgress: [recipientId],
      });
    });

    it('should call API and show notification if recipient name is already taken', () => {
      mockRecipientService.functions.updateRecipient.mockReturnValue(throwError(() => ({
        error: {
          message: 'Duplicate recipient name',
        },
      })));

      dispatcher.dispatch(recipientApiEvents.updateRecipientInitiated({
        recipientId,
        ...recipientRequest, 
      }));
      
      validateDispatcher(dispatchSpy, recipientApiEvents.updateRecipientFailed({
        recipientId,
      }), notificationEvents.showMessage(`Partner (${recipientRequest.name}) már létezik!`));
      validateState({
        isInProgress: [recipientId],
      });

    });

    it('should call API and show notification if there is an error', () => {
      mockRecipientService.functions.updateRecipient.mockReturnValue(throwError(() => ({
        error: {
          message: 'There is an error',
        },
      })));

      dispatcher.dispatch(recipientApiEvents.updateRecipientInitiated({
        recipientId,
        ...recipientRequest, 
      }));

      validateFunctionCall(mockRecipientService.functions.updateRecipient, recipientId, recipientRequest);
      validateDispatcher(dispatchSpy, recipientApiEvents.updateRecipientFailed({
        recipientId,
      }), notificationEvents.showMessage('Hiba történt'));
      validateState({
        isInProgress: [recipientId],
      });
    });
  });

  describe('dispatching updateRecipientCompleted', () => {
    it('should update store', () => {
      const originalRecipient = testDataFactory.recipient.response();
      setup({
        isInProgress: [originalRecipient.recipientId],
        recipientList: [originalRecipient],
      });

      const name = 'ékezetes név';
      const recipientRequest = testDataFactory.recipient.request({
        name,
      });

      dispatcher.dispatch(recipientApiEvents.updateRecipientCompleted({
        recipientId: originalRecipient.recipientId,
        ...recipientRequest,
      }));

      validateDispatcher(dispatchSpy);
      validateState({
        isInProgress: [],
        recipientList: [
          {
            recipientId: originalRecipient.recipientId,
            ...recipientRequest,
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

  describe('dispatching updateRecipientFailed', () => {
    it('should update store', () => {
      const originalRecipient = testDataFactory.recipient.response();
      setup({
        isInProgress: [originalRecipient.recipientId],
        recipientList: [originalRecipient],
      });

      dispatcher.dispatch(recipientApiEvents.updateRecipientFailed({
        recipientId: originalRecipient.recipientId,
      }));

      validateDispatcher(dispatchSpy);
      validateState({
        isInProgress: [],
      });
    });
  });

  describe('dispatching deleteRecipientInitiated', () => {
    let originalRecipient: Responses.Recipient;
    let recipientId: Api.Recipient.Id;
    
    beforeEach(() => {
      originalRecipient = testDataFactory.recipient.response();
      recipientId = originalRecipient.recipientId;

      setup({
        recipientList: [originalRecipient],
      });
    });

    it('should call API and dispatch response', () => {
      mockRecipientService.functions.deleteRecipient.mockReturnValue(of(undefined));

      dispatcher.dispatch(recipientApiEvents.deleteRecipientInitiated({
        recipientId, 
      }));

      validateFunctionCall(mockRecipientService.functions.deleteRecipient, recipientId);
      validateDispatcher(dispatchSpy, recipientApiEvents.deleteRecipientCompleted({
        recipientId,
      }));
      validateState({
        isInProgress: [recipientId],
      });
    });

    it('should call API and show notification if there is an error', () => {
      mockRecipientService.functions.deleteRecipient.mockReturnValue(throwError(() => ({
        error: {
          message: 'There is an error',
        },
      })));

      dispatcher.dispatch(recipientApiEvents.deleteRecipientInitiated({
        recipientId, 
      }));

      validateFunctionCall(mockRecipientService.functions.deleteRecipient, recipientId);
      validateDispatcher(dispatchSpy, recipientApiEvents.deleteRecipientFailed({
        recipientId,
      }), notificationEvents.showMessage('Hiba történt'));
      validateState({
        isInProgress: [recipientId],
      });
    });
  });

  describe('dispatching deleteRecipientCompleted', () => {
    it('should update store', () => {
      const originalRecipient = testDataFactory.recipient.response();
      setup({
        isInProgress: [originalRecipient.recipientId],
        recipientList: [originalRecipient],
      });
      const recipientRequest = testDataFactory.recipient.request();

      dispatcher.dispatch(recipientApiEvents.deleteRecipientCompleted({
        recipientId: originalRecipient.recipientId,
        ...recipientRequest,
      }));

      validateDispatcher(dispatchSpy);
      validateState({
        isInProgress: [],
        recipientList: [],
      });
    });
  });

  describe('dispatching deleteRecipientFailed', () => {
    it('should update store', () => {
      const originalRecipient = testDataFactory.recipient.response();
      setup({
        isInProgress: [originalRecipient.recipientId],
        recipientList: [originalRecipient],
      });

      dispatcher.dispatch(recipientApiEvents.deleteRecipientFailed({
        recipientId: originalRecipient.recipientId,
      }));

      validateDispatcher(dispatchSpy);
      validateState({
        isInProgress: [],
      });
    });
  });

  describe('dispatching mergeRecipientInitiated', () => {
    let targetRecipient: Responses.Recipient;
    let sourceRecipient: Responses.Recipient;
    
    beforeEach(() => {
      targetRecipient = testDataFactory.recipient.response();
      sourceRecipient = testDataFactory.recipient.response();

      setup({
        recipientList: [
          targetRecipient,
          sourceRecipient,
        ],
      });
    });

    it('should call API and dispatch response', () => {
      mockRecipientService.functions.mergeRecipients.mockReturnValue(of(undefined));

      dispatcher.dispatch(recipientApiEvents.mergeRecipientsInitiated({
        sourceRecipientIds: [sourceRecipient.recipientId],
        targetRecipientId: targetRecipient.recipientId,
      }));

      validateFunctionCall(mockRecipientService.functions.mergeRecipients, targetRecipient.recipientId, [sourceRecipient.recipientId]);
      validateDispatcher(dispatchSpy, recipientApiEvents.mergeRecipientsCompleted({
        sourceRecipientIds: [sourceRecipient.recipientId],
      }));
      validateState({
        isInProgress: [sourceRecipient.recipientId],
      });
    });

    it('should call API and show notification if there is an error', () => {
      mockRecipientService.functions.mergeRecipients.mockReturnValue(throwError(() => ({
        error: {
          message: 'There is an error',
        },
      })));

      dispatcher.dispatch(recipientApiEvents.mergeRecipientsInitiated({
        sourceRecipientIds: [sourceRecipient.recipientId],
        targetRecipientId: targetRecipient.recipientId,
      }));

      validateFunctionCall(mockRecipientService.functions.mergeRecipients, targetRecipient.recipientId, [sourceRecipient.recipientId]);
      validateDispatcher(dispatchSpy, recipientApiEvents.mergeRecipientsFailed({
        sourceRecipientIds: [sourceRecipient.recipientId],
      }), notificationEvents.showMessage('Hiba történt'));
      validateState({
        isInProgress: [sourceRecipient.recipientId],
      });
    });
  });

  describe('dispatching mergeRecipientCompleted', () => {
    it('should update store', () => {
      const sourceRecipient = testDataFactory.recipient.response();
      setup({
        isInProgress: [sourceRecipient.recipientId],
        recipientList: [sourceRecipient],
      });

      dispatcher.dispatch(recipientApiEvents.mergeRecipientsCompleted({
        sourceRecipientIds: [sourceRecipient.recipientId],
      }));

      validateDispatcher(dispatchSpy);
      validateState({
        isInProgress: [],
        recipientList: [],
      });
    });
  });

  describe('dispatching mergeRecipientFailed', () => {
    it('should update store', () => {
      const sourceRecipient = testDataFactory.recipient.response();
      setup({
        isInProgress: [sourceRecipient.recipientId],
        recipientList: [sourceRecipient],
      });

      dispatcher.dispatch(recipientApiEvents.mergeRecipientsFailed({
        sourceRecipientIds: [sourceRecipient.recipientId],
      }));

      validateDispatcher(dispatchSpy);
      validateState({
        isInProgress: [],
      });
    });
  });
});
