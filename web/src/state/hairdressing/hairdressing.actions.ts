import { Transaction } from '@household/shared/types/types';
import { createActionGroup, props } from '@ngrx/store';

export const hairdressingActions = createActionGroup({
  source: 'Hairdressing',
  events: {
    'List income initiated': props<{date: Date}>(),
    'List income completed': props<{transactions: Transaction.Report[], month: string}>(),
    'Save income initiated': props<Pick<Transaction.PaymentRequest, 'issuedAt' | 'amount' | 'description'>>(),
    'Save income completed': props<Pick<Transaction.PaymentRequest, 'issuedAt' | 'amount' | 'description'> & Transaction.TransactionId>(),
    'Update income initiated': props<Pick<Transaction.PaymentRequest, 'issuedAt' | 'amount' | 'description'> & Transaction.TransactionId>(),
    'Update income completed': props<Pick<Transaction.PaymentRequest, 'issuedAt' | 'amount' | 'description'> & Transaction.TransactionId>(),
    'Delete income initiated': props<Transaction.TransactionId>(),
    'Delete income completed': props<Transaction.TransactionId>(),
  },
});
