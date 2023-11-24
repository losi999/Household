import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Account, Category, Project, Recipient, Transaction } from '@household/shared/types/types';
import { AccountService } from 'src/app/account/account.service';
import { CategoryService } from 'src/app/category/category.service';
import { transactionsPageSize } from 'src/app/constants';
import { ProjectService } from 'src/app/project/project.service';
import { RecipientService } from 'src/app/recipient/recipient.service';
import { TransactionService } from 'src/app/transaction/transaction.service';

export const transactionResolver: ResolveFn<Transaction.Response> = (route) => {
  return inject(TransactionService).getTransactionById(route.paramMap.get('transactionId') as Transaction.Id, route.paramMap.get('accountId') as Account.Id);
};

export const accountListResolver: ResolveFn<Account.Response[]> = () => {
  return inject(AccountService).listAccounts();
};

export const accountTransactionListResolver: ResolveFn<Transaction.Response[]> = (route) => {
  return inject(TransactionService).listTransactionsByAccountId(route.paramMap.get('accountId') as Account.Id, 1, (route.queryParams.page ?? 1) * transactionsPageSize);
};

export const categoryListResolver: ResolveFn<Category.Response[]> = () => {
  return inject(CategoryService).listCategories();
};

export const productListResolver: ResolveFn<Category.Response[]> = () => {
  return inject(CategoryService).listCategories('inventory');
};

export const projectListResolver: ResolveFn<Project.Response[]> = () => {
  return inject(ProjectService).listProjects();
};

export const recipientListResolver: ResolveFn<Recipient.Response[]> = () => {
  return inject(RecipientService).listRecipients();
};
