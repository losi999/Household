import { TestBed } from '@angular/core/testing';
import { RecipientService } from '@household/services/recipient-service';
import { createDispatcherSpy, notificationEvents, validateDispatcher } from '@household/shared-ui';
import { Dispatcher } from '@ngrx/signals/events';
import { signalStore } from '@ngrx/signals';
import { Mock } from 'vitest';
import { createMockService, MockService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { recipientApiEvents } from '@household/state/recipient/recipient-events';
import { withRecipientApiEvents } from '@household/state/recipient/with-recipient-api-events';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { of, throwError } from 'rxjs';

describe('withRecipientApiEvents', () => {
  let dispatcher: Dispatcher;
  let dispatchSpy: Mock;
  let mockRecipientService: MockService<RecipientService>;

  const setup = () => {
    TestBed.resetTestingModule();

    mockRecipientService = createMockService('listRecipients', 'createRecipient', 'updateRecipient', 'deleteRecipient', 'mergeRecipients');

    TestBed.configureTestingModule({
      providers: [
        {
          provide: RecipientService,
          useValue: mockRecipientService.service,
        },
      ],
    });

    TestBed.inject(signalStore({
      providedIn: 'root',
    }, withRecipientApiEvents()));
    dispatcher = TestBed.inject(Dispatcher);
    dispatchSpy = createDispatcherSpy(dispatcher);
  };

  beforeEach(() => {
    setup();
  });

  describe('dispatching listRecipientsInitiated', () => {
    it('should call API and dispatch response', () => {
      const recipientList = [testDataFactory.recipient.response()];
      mockRecipientService.functions.listRecipients.mockReturnValue(of(recipientList));

      dispatcher.dispatch(recipientApiEvents.listRecipientsInitiated());

      expect(mockRecipientService.functions.listRecipients).toHaveBeenCalled();
      validateDispatcher(dispatchSpy, recipientApiEvents.listRecipientsCompleted(recipientList));
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
    });
  });

  describe('dispatching updateRecipientInitiated', () => {
    const recipientRequest = testDataFactory.recipient.request();
    const recipientId = testDataFactory.recipient.id();

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

      validateFunctionCall(mockRecipientService.functions.updateRecipient, recipientId, recipientRequest);
      validateDispatcher(dispatchSpy, recipientApiEvents.updateRecipientFailed({
        recipientId,
      }), notificationEvents.showMessage(`Partner (${recipientRequest.name}) már létezik!`));
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
    });
  });

  describe('dispatching deleteRecipientInitiated', () => {
    const recipientId = testDataFactory.recipient.id();

    it('should call API and dispatch response', () => {
      mockRecipientService.functions.deleteRecipient.mockReturnValue(of(undefined));

      dispatcher.dispatch(recipientApiEvents.deleteRecipientInitiated({
        recipientId,
      }));

      validateFunctionCall(mockRecipientService.functions.deleteRecipient, recipientId);
      validateDispatcher(dispatchSpy, recipientApiEvents.deleteRecipientCompleted({
        recipientId,
      }));
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
    });
  });

  describe('dispatching mergeRecipientsInitiated', () => {
    const targetRecipientId = testDataFactory.recipient.id();
    const sourceRecipientId = testDataFactory.recipient.id();

    it('should call API and dispatch response', () => {
      mockRecipientService.functions.mergeRecipients.mockReturnValue(of(undefined));

      dispatcher.dispatch(recipientApiEvents.mergeRecipientsInitiated({
        sourceRecipientIds: [sourceRecipientId],
        targetRecipientId,
      }));

      validateFunctionCall(mockRecipientService.functions.mergeRecipients, targetRecipientId, [sourceRecipientId]);
      validateDispatcher(dispatchSpy, recipientApiEvents.mergeRecipientsCompleted({
        sourceRecipientIds: [sourceRecipientId],
      }));
    });

    it('should call API and show notification if there is an error', () => {
      mockRecipientService.functions.mergeRecipients.mockReturnValue(throwError(() => ({
        error: {
          message: 'There is an error',
        },
      })));

      dispatcher.dispatch(recipientApiEvents.mergeRecipientsInitiated({
        sourceRecipientIds: [sourceRecipientId],
        targetRecipientId,
      }));

      validateFunctionCall(mockRecipientService.functions.mergeRecipients, targetRecipientId, [sourceRecipientId]);
      validateDispatcher(dispatchSpy, recipientApiEvents.mergeRecipientsFailed({
        sourceRecipientIds: [sourceRecipientId],
      }), notificationEvents.showMessage('Hiba történt'));
    });
  });
});
