import { Price, Transaction } from '@household/shared/types/types';
import { createActionGroup, emptyProps, props } from '@ngrx/store';

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

export const hairdressingApiActions = createActionGroup({
  source: 'Hairdressing API',
  events: {
    'List prices initiated': emptyProps(),
    'List prices completed': props<{prices: Price.Response[]}>(),
    'Create price initiated': props<Price.Request>(),
    'Create price completed': props<Price.PriceId & Price.Request>(),
    'Update price initiated': props<Price.PriceId & Price.Request>(),
    'Update price completed': props<Price.PriceId & Price.Request>(),
    'Delete price initiated': props<Price.PriceId>(),
    'Delete price completed': props<Price.PriceId>(),
    'Delete price failed': props<Price.PriceId>(),
  },
});
