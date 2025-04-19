import { FormControl } from '@angular/forms';
import { TransactionType } from '@household/shared/enums';
import { Account, Project, Category, Recipient, Transaction } from '@household/shared/types/types';

export type FormGroupify<T> = {
  [P in keyof T]: FormControl<T[P]>
};

export type TransactionImportUpdatableFields = {
  account: Account.Response;
  project: Project.Response;
  category: Category.Response;
  recipient: Recipient.Response;
  description: string;
  transferAccount: Account.Response;
  loanAccount: Account.Response;
};

export type ImportedTransaction = Transaction.TransactionId
& Transaction.Amount
& Transaction.IssuedAt<string>
& Transaction.TransactionType<TransactionType.Draft |TransactionType.Payment | TransactionType.Transfer>
& Partial<Transaction.Description>
& Partial<Transaction.Account<Account.Response>>
& Partial<Transaction.TransferAccount<Account.Response>>
& Partial<Transaction.Category<Category.Response>>
& Partial<Transaction.Project<Project.Response>>
& Partial<Transaction.Recipient<Recipient.Response>>
& {
  loanAccount?: Account.Response;
};
