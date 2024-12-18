import { Pipe, PipeTransform } from '@angular/core';
import { Transaction } from '@household/shared/types/types';

@Pipe({
  name: 'deferredTransactionFilter',
  standalone: false,
})
export class DeferredTransactionFilterPipe implements PipeTransform {

  transform(transactions: Transaction.DeferredResponse[], payments: (Transaction.Amount & {
    transaction: Transaction.DeferredResponse;
  })[]): Transaction.DeferredResponse[] {
    const paymentIds = payments.map(p => p.transaction.transactionId);

    return transactions?.filter(t => !paymentIds.includes(t.transactionId));
  }

}
