import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Account, Transaction } from '@household/shared/types/types';
import { transactionsPageSize } from '@household/web/app/constants';
import { TransactionService } from '@household/web/services/transaction.service';

export const transactionResolver: ResolveFn<Transaction.Response> = (route) => {
  return inject(TransactionService).getTransactionById(route.paramMap.get('transactionId') as Transaction.Id, route.paramMap.get('accountId') as Account.Id);
};

