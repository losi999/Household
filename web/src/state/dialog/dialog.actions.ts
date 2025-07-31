import { Account, Category, File, Product, Project, Recipient, Transaction, User } from '@household/shared/types/types';
import { Action, createActionGroup, emptyProps, props } from '@ngrx/store';

export const dialogActions = createActionGroup({
  source: 'Dialog',
  events: {
    'Create project': emptyProps(),
    'Update project': props<Project.Response>(),
    'Delete project': props<Project.Response>(),
    'Merge projects': props<Project.Response>(),
    'Create recipient': emptyProps(),
    'Update recipient': props<Recipient.Response>(),
    'Delete recipient': props<Recipient.Response>(),
    'Merge recipients': props<Recipient.Response>(),
    'Create category': emptyProps(),
    'Update category': props<Category.Response>(),
    'Delete category': props<Category.Response>(),
    'Merge categories': props<Category.Response>(),
    'Create product': props<Category.CategoryId>(),
    'Update product': props<{product: Product.Response} & Category.CategoryId>(),
    'Delete product': props<{product: Product.Response} & Category.CategoryId>(),
    'Merge products': props<{product: Product.Response} & Category.CategoryId>(),
    'Create account': emptyProps(),
    'Update account': props<Account.Response>(),
    'Delete account': props<Account.Response>(),
    'Import file': emptyProps(),
    'Delete file': props<File.Response>(),
    'Delete income': props<Transaction.TransactionId & {day: Date}>(),
    'Delete user': props<User.Email>(),
    'Delete draft transactions': props<{transactionIds: Transaction.Id[]}>(),
    'Delete transaction': props<Transaction.TransactionId & {navigationAction?: Action;}>(),
  },
});
