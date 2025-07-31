import { File, Transaction } from '@household/shared/types/types';
import { TransactionImportUpdatableFields } from '@household/web/types/common';
import { createActionGroup, props } from '@ngrx/store';

export const importActions = createActionGroup({
  source: 'Import',
  events: {
    'Apply editing fields': props<{
      transactionIds: Transaction.Id[];
      updatedValues: Partial<TransactionImportUpdatableFields>
    }>(),
    'Import transactions': props<{
      transactionIds?: Transaction.Id[];
    }>(),
    'Deduplicate draft transaction': props<Transaction.TransactionId>(),
    'Import payment transaction initiated': props<Transaction.TransactionId & Transaction.PaymentRequest>(),
    'Import payment transaction completed': props<Transaction.TransactionId>(),
    'Import transfer transaction initiated': props<Transaction.TransactionId & Transaction.TransferRequest>(),
    'Import transfer transaction completed': props<Transaction.TransactionId>(),
  },
});
