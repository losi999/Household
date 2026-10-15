import { TestBed } from '@angular/core/testing';
import { Dispatcher } from '@ngrx/signals/events';
import { signalStore, withState } from '@ngrx/signals';
import { transactionApiEvents } from '@household/state/transaction/transaction-events';
import { TransactionState } from '@household/state/transaction/transaction-store';
import { withTransactionReducer } from '@household/state/transaction/with-transaction-reducer';
import { testDataFactory } from '@household/shared/common/test-data-factory';

const createTestStore = (state: TransactionState) => {
  return signalStore({
    providedIn: 'root',
  }, withState<TransactionState>(state), withTransactionReducer());
};

describe('withTransactionReducer', () => {
  let initialState: TransactionState;
  let store: InstanceType<ReturnType<typeof createTestStore>>;
  let dispatcher: Dispatcher;

  const validateState = (currentValue?: Partial<TransactionState>) => {
    expect(store.transactionList(), 'transactionList').toEqual(Object.hasOwn(currentValue ?? {}, 'transactionList') ? currentValue.transactionList : initialState.transactionList);
  };

  const setup = (initial?: Partial<TransactionState>) => {
    TestBed.resetTestingModule();

    initialState = {
      transactionList: [],
      ...initial,
    };

    store = TestBed.inject(createTestStore(initialState));
    dispatcher = TestBed.inject(Dispatcher);
  };

  beforeEach(() => {
    setup();
  });

  describe('listTransactionsByAccountInitiated', () => {
    it('should clear the previously stored transactions if the first page is requested', () => {
      setup({
        transactionList: [testDataFactory.transaction.response.payment()],
      });

      dispatcher.dispatch(transactionApiEvents.listTransactionsByAccountInitiated({
        accountId: testDataFactory.account.id(),
        pageNumber: 1,
        pageSize: 75,
      }));

      validateState({
        transactionList: [],
      });
    });

    it('should keep the stored transactions if a later page is requested', () => {
      const transactionList = [testDataFactory.transaction.response.payment()];
      setup({
        transactionList,
      });

      dispatcher.dispatch(transactionApiEvents.listTransactionsByAccountInitiated({
        accountId: testDataFactory.account.id(),
        pageNumber: 2,
        pageSize: 25,
      }));

      validateState({
        transactionList,
      });
    });
  });

  describe('listTransactionsByAccountCompleted', () => {
    it('should store the transactions of the first page in the given order', () => {
      const transaction1 = testDataFactory.transaction.response.payment();
      const transaction2 = testDataFactory.transaction.response.transfer();

      dispatcher.dispatch(transactionApiEvents.listTransactionsByAccountCompleted({
        pageNumber: 1,
        transactions: [
          transaction1,
          transaction2,
        ],
      }));

      validateState({
        transactionList: [
          transaction1,
          transaction2,
        ],
      });
    });

    it('should replace the stored transactions with the first page', () => {
      setup({
        transactionList: [testDataFactory.transaction.response.payment()],
      });
      const transaction = testDataFactory.transaction.response.transfer();

      dispatcher.dispatch(transactionApiEvents.listTransactionsByAccountCompleted({
        pageNumber: 1,
        transactions: [transaction],
      }));

      validateState({
        transactionList: [transaction],
      });
    });

    it('should append the transactions of a later page', () => {
      const transaction1 = testDataFactory.transaction.response.payment();
      const transaction2 = testDataFactory.transaction.response.transfer();
      setup({
        transactionList: [transaction1],
      });

      dispatcher.dispatch(transactionApiEvents.listTransactionsByAccountCompleted({
        pageNumber: 2,
        transactions: [transaction2],
      }));

      validateState({
        transactionList: [
          transaction1,
          transaction2,
        ],
      });
    });
  });
});
