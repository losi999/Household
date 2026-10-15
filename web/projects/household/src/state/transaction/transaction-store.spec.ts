import { TestBed } from '@angular/core/testing';
import { TransactionService } from '@household/services/transaction-service';
import { provideTransactionStoreInitialState, TransactionState, TransactionStore } from '@household/state/transaction/transaction-store';
import { Dispatcher } from '@ngrx/signals/events';
import { createMockService, MockService } from '@household/shared/common/unit-testing';
import { transactionApiEvents } from '@household/state/transaction/transaction-events';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { of } from 'rxjs';

// The behavior of each store feature is covered in its own spec (with-transaction-reducer.spec.ts,
// with-transaction-api-events.spec.ts). This spec only verifies that the store provides its initial state and has every
// feature wired in.
describe('Transaction store', () => {
  let initialState: TransactionState;
  let store: InstanceType<typeof TransactionStore>;
  let dispatcher: Dispatcher;
  let mockTransactionService: MockService<TransactionService>;

  const setup = (initial?: Partial<TransactionState>) => {
    TestBed.resetTestingModule();

    initialState = {
      transactionList: [],
      ...initial,
    };

    mockTransactionService = createMockService('listTransactionsByAccount');

    TestBed.configureTestingModule({
      providers: [
        {
          provide: TransactionService,
          useValue: mockTransactionService.service,
        },
        provideTransactionStoreInitialState(initialState),
      ],
    });

    store = TestBed.inject(TransactionStore);
    dispatcher = TestBed.inject(Dispatcher);
  };

  it('should initialize with the provided state', () => {
    const transactionList = [testDataFactory.transaction.response.payment()];

    setup({
      transactionList,
    });

    expect(store.transactionList()).toEqual(transactionList);
  });

  it('should initialize with the default state', () => {
    setup();

    expect(store.transactionList()).toEqual([]);
  });

  it('should have the reducer wired in', () => {
    setup();
    const transaction = testDataFactory.transaction.response.payment();

    dispatcher.dispatch(transactionApiEvents.listTransactionsByAccountCompleted({
      pageNumber: 1,
      transactions: [transaction],
    }));

    expect(store.transactionList()).toEqual([transaction]);
  });

  it('should have the API event handlers and the reducer working together', () => {
    setup();
    const accountId = testDataFactory.account.id();
    const transaction = testDataFactory.transaction.response.payment();
    mockTransactionService.functions.listTransactionsByAccount.mockReturnValue(of([transaction]));

    dispatcher.dispatch(transactionApiEvents.listTransactionsByAccountInitiated({
      accountId,
      pageNumber: 1,
      pageSize: 25,
    }));

    expect(mockTransactionService.functions.listTransactionsByAccount).toHaveBeenCalledWith(accountId, {
      pageNumber: 1,
      pageSize: 25,
    });
    expect(store.transactionList()).toEqual([transaction]);
  });
});
