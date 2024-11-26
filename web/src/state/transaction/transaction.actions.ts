import { Account, Common, Transaction } from '@household/shared/types/types';
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import {} from '@ngrx/effects';

export const transactionApiActions = createActionGroup({
  source: 'Transaction API',
  events: {
    'List transactions initiated': props<Account.AccountId & Common.Pagination<number>>(),
    'List transactions completed': props<Common.Pagination<number> & { transactions: Transaction.Response[] }>(),
    'List deferred transactions initiated': props<Transaction.IsSettled>(),
    'List deferred transactions completed': props<{ transactions: Transaction.DeferredResponse[] }>(),
    'Create payment transaction initiated': props<Transaction.PaymentRequest>(),
    'Create payment transaction completed': props<Account.AccountId & Transaction.TransactionId>(),
    'Create split transaction initiated': props<Transaction.SplitRequest>(),
    'Create split transaction completed': props<Account.AccountId & Transaction.TransactionId>(),
    'Create transfer transaction initiated': props<Transaction.TransferRequest>(),
    'Create transfer transaction completed': props<Account.AccountId & Transaction.TransactionId>(),
    // 'Update transaction initiated': props<Transaction.TransactionId & Transaction.Request>(),
    // 'Update transaction completed': props<Transaction.TransactionId & Transaction.Request>(),
    'Delete transaction initiated': props<Transaction.TransactionId>(),
    'Delete transaction completed': props<Transaction.TransactionId>(),
    'Delete transaction failed': props<Transaction.TransactionId>(),
    'Get transaction initiated': props<Account.AccountId & Transaction.TransactionId>(),
    'Get transaction completed': props<Transaction.Response>(),
  },
});
