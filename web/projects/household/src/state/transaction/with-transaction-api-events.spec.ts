import { TestBed } from '@angular/core/testing';
import { createDispatcherSpy, notificationEvents, validateDispatcher } from '@household/shared-ui';
import { Dispatcher } from '@ngrx/signals/events';
import { signalStore } from '@ngrx/signals';
import { Mock } from 'vitest';
import { createMockService, MockService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { TransactionService } from '@household/services/transaction-service';
import { transactionApiEvents } from '@household/state/transaction/transaction-events';
import { withTransactionApiEvents } from '@household/state/transaction/with-transaction-api-events';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { of, Subject, throwError } from 'rxjs';
import { Responses } from '@household/shared/types/responses';

describe('withTransactionApiEvents', () => {
  let dispatcher: Dispatcher;
  let dispatchSpy: Mock;
  let mockTransactionService: MockService<TransactionService>;

  const setup = () => {
    TestBed.resetTestingModule();

    mockTransactionService = createMockService('listTransactionsByAccount', 'deleteTransaction');

    TestBed.configureTestingModule({
      providers: [
        {
          provide: TransactionService,
          useValue: mockTransactionService.service,
        },
      ],
    });

    TestBed.inject(signalStore({
      providedIn: 'root',
    }, withTransactionApiEvents()));
    dispatcher = TestBed.inject(Dispatcher);
    dispatchSpy = createDispatcherSpy(dispatcher);
  };

  beforeEach(() => {
    setup();
  });

  describe('dispatching listTransactionsByAccountInitiated', () => {
    const accountId = testDataFactory.account.id();
    const pagination = {
      pageNumber: 1,
      pageSize: 25,
    };

    it('should call API and dispatch response', () => {
      const transactionList = [testDataFactory.transaction.response.payment()];
      mockTransactionService.functions.listTransactionsByAccount.mockReturnValue(of(transactionList));

      dispatcher.dispatch(transactionApiEvents.listTransactionsByAccountInitiated({
        accountId,
        ...pagination,
      }));

      validateFunctionCall(mockTransactionService.functions.listTransactionsByAccount, accountId, pagination);
      validateDispatcher(dispatchSpy, transactionApiEvents.listTransactionsByAccountCompleted({
        pageNumber: 1,
        transactions: transactionList,
      }));
    });

    it('should call API and show notification if there is an error', () => {
      mockTransactionService.functions.listTransactionsByAccount.mockReturnValue(throwError(() => ({
        error: {
          message: 'There is an error',
        },
      })));

      dispatcher.dispatch(transactionApiEvents.listTransactionsByAccountInitiated({
        accountId,
        ...pagination,
      }));

      validateFunctionCall(mockTransactionService.functions.listTransactionsByAccount, accountId, pagination);
      validateDispatcher(dispatchSpy, notificationEvents.showMessage('Hiba történt'));
    });

    it('should handle the requests one after the other, so no page is lost', () => {
      // The dispatcher spy lets only the first dispatch through, here both requests have to reach the handler
      dispatchSpy.mockRestore();
      const dispatchCalls = vi.spyOn(dispatcher, 'dispatch');
      const firstResponse = new Subject<Responses.Transaction[]>();
      const firstTransactionList = [testDataFactory.transaction.response.payment()];
      const secondTransactionList = [testDataFactory.transaction.response.transfer()];
      mockTransactionService.functions.listTransactionsByAccount.mockReturnValueOnce(firstResponse);
      mockTransactionService.functions.listTransactionsByAccount.mockReturnValueOnce(of(secondTransactionList));

      dispatcher.dispatch(transactionApiEvents.listTransactionsByAccountInitiated({
        accountId,
        pageNumber: 1,
        pageSize: 25,
      }));
      dispatcher.dispatch(transactionApiEvents.listTransactionsByAccountInitiated({
        accountId,
        pageNumber: 2,
        pageSize: 25,
      }));

      expect(mockTransactionService.functions.listTransactionsByAccount).toHaveBeenCalledTimes(1);

      firstResponse.next(firstTransactionList);
      firstResponse.complete();

      expect(mockTransactionService.functions.listTransactionsByAccount).toHaveBeenNthCalledWith(2, accountId, {
        pageNumber: 2,
        pageSize: 25,
      });
      expect(dispatchCalls).toHaveBeenCalledTimes(4);
      expect(dispatchCalls).toHaveBeenNthCalledWith(3, transactionApiEvents.listTransactionsByAccountCompleted({
        pageNumber: 1,
        transactions: firstTransactionList,
      }), undefined);
      expect(dispatchCalls).toHaveBeenNthCalledWith(4, transactionApiEvents.listTransactionsByAccountCompleted({
        pageNumber: 2,
        transactions: secondTransactionList,
      }), undefined);
    });
  });

  describe('dispatching deleteTransactionInitiated', () => {
    const transactionId = testDataFactory.transaction.id();

    it('should call API and dispatch response', () => {
      mockTransactionService.functions.deleteTransaction.mockReturnValue(of(undefined));

      dispatcher.dispatch(transactionApiEvents.deleteTransactionInitiated({
        transactionId,
      }));

      validateFunctionCall(mockTransactionService.functions.deleteTransaction, transactionId);
      validateDispatcher(dispatchSpy, transactionApiEvents.deleteTransactionCompleted({
        transactionId,
      }));
    });

    it('should call API and show notification if there is an error', () => {
      mockTransactionService.functions.deleteTransaction.mockReturnValue(throwError(() => ({
        error: {
          message: 'There is an error',
        },
      })));

      dispatcher.dispatch(transactionApiEvents.deleteTransactionInitiated({
        transactionId,
      }));

      validateFunctionCall(mockTransactionService.functions.deleteTransaction, transactionId);
      validateDispatcher(dispatchSpy, transactionApiEvents.deleteTransactionFailed({
        transactionId,
      }), notificationEvents.showMessage('Hiba történt'));
    });
  });
});
