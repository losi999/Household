import { TestBed } from '@angular/core/testing';
import { createDispatcherSpy, DialogService, validateDispatcher } from '@household/shared-ui';
import { Dispatcher } from '@ngrx/signals/events';
import { signalStore } from '@ngrx/signals';
import { Mock } from 'vitest';
import { createMockService, MockService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { transactionApiEvents, transactionEvents } from '@household/state/transaction/transaction-events';
import { withTransactionEvents } from '@household/state/transaction/with-transaction-events';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { of } from 'rxjs';

describe('withTransactionEvents', () => {
  let dispatcher: Dispatcher;
  let dispatchSpy: Mock;
  let mockDialogService: MockService<DialogService>;

  const setup = () => {
    TestBed.resetTestingModule();

    mockDialogService = createMockService('openConfirmationDialog');

    TestBed.configureTestingModule({
      providers: [
        {
          provide: DialogService,
          useValue: mockDialogService.service,
        },
      ],
    });

    TestBed.inject(signalStore({
      providedIn: 'root',
    }, withTransactionEvents()));
    dispatcher = TestBed.inject(Dispatcher);
    dispatchSpy = createDispatcherSpy(dispatcher);
  };

  beforeEach(() => {
    setup();
  });

  describe('dispatching deleteTransaction', () => {
    const transaction = testDataFactory.transaction.response.payment();

    it('should open dialog and dispatch if confirmed', () => {
      mockDialogService.functions.openConfirmationDialog.mockReturnValue(of(true));

      dispatcher.dispatch(transactionEvents.deleteTransaction(transaction));

      validateFunctionCall(mockDialogService.functions.openConfirmationDialog, {
        title: 'Törölni akarod ezt a tranzakciót?',
      });
      validateDispatcher(dispatchSpy, transactionApiEvents.deleteTransactionInitiated({
        transactionId: transaction.transactionId,
      }));
    });

    it('should open dialog and not dispatch anything if cancelled', () => {
      mockDialogService.functions.openConfirmationDialog.mockReturnValue(of(false));

      dispatcher.dispatch(transactionEvents.deleteTransaction(transaction));

      validateFunctionCall(mockDialogService.functions.openConfirmationDialog, {
        title: 'Törölni akarod ezt a tranzakciót?',
      });
      validateDispatcher(dispatchSpy);
    });
  });
});
