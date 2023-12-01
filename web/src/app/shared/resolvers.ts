import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Account, Transaction } from '@household/shared/types/types';
import { transactionsPageSize } from 'src/app/constants';
import { TransactionService } from 'src/app/transaction/transaction.service';

export const transactionResolver: ResolveFn<Transaction.Response> = (route) => {
  return inject(TransactionService).getTransactionById(route.paramMap.get('transactionId') as Transaction.Id, route.paramMap.get('accountId') as Account.Id);
};

export const accountTransactionListResolver: ResolveFn<Transaction.Response[]> = (route) => {
  return inject(TransactionService).listTransactionsByAccountId(route.paramMap.get('accountId') as Account.Id, 1, (route.queryParams.page ?? 1) * transactionsPageSize);
};

