import { Account, Category, File, Price, Product, Project, Recipient, Transaction } from '@household/shared/types/types';
import { createReducer, on } from '@ngrx/store';
import { categoryApiActions } from '@household/web/state/category/category.actions';
import { progressActions } from '@household/web/state/progress/progress.actions';
import { projectApiActions } from '@household/web/state/project/project.actions';
import { recipientApiActions } from '@household/web/state/recipient/recipient.actions';
import { productApiActions } from '@household/web/state/product/product.actions';
import { accountApiActions } from '@household/web/state/account/account.actions';
import { transactionApiActions } from '@household/web/state/transaction/transaction.actions';
import { fileApiActions } from '@household/web/state/file/file.actions';
import { userApiActions } from '@household/web/state/user/user.actions';
import { hairdressingApiActions } from '@household/web/state/hairdressing/hairdressing.actions';

export type ProgressState = {
  counter: number;
  inProgressProjects: Project.Id[];
  inProgressPrices: Price.Id[];
  inProgressCategories: Category.Id[];
  inProgressRecipients: Recipient.Id[];
  inProgressProducts: Product.Id[];
  inProgressAccounts: Account.Id[];
  inProgressTransactions: Transaction.Id[];
  inProgressFiles: File.Id[];
  inProgressUserGroups: string[];
};

export const progressReducer = createReducer<ProgressState>({
  counter: 0,
  inProgressProjects: [],
  inProgressPrices: [],
  inProgressRecipients: [],
  inProgressCategories: [],
  inProgressProducts: [],
  inProgressAccounts: [],
  inProgressTransactions: [],
  inProgressFiles: [],
  inProgressUserGroups: [],
},
on(progressActions.processStarted, (_state) => {
  return {
    ..._state,
    counter: _state.counter + 1,
  };
}),
on(progressActions.processFinished, (_state) => {
  return {
    ..._state,
    counter: _state.counter - 1,
  };
}),
on(projectApiActions.deleteProjectInitiated, (_state, { projectId }) => {
  return {
    ..._state,
    inProgressProjects: [
      ..._state.inProgressProjects,
      projectId,
    ],
  };
}),
on(projectApiActions.deleteProjectCompleted, projectApiActions.deleteProjectFailed, (_state, { projectId }) => {
  return {
    ..._state,
    inProgressProjects: _state.inProgressProjects.filter(p => p !== projectId),
  };
}),
on(projectApiActions.mergeProjectsInitiated, (_state, { sourceProjectIds }) => {
  return {
    ..._state,
    inProgressProjects: [
      ..._state.inProgressProjects,
      ...sourceProjectIds,
    ],
  };
}),
on(projectApiActions.mergeProjectsCompleted, projectApiActions.mergeProjectsFailed, (_state, { sourceProjectIds }) => {
  return {
    ..._state,
    inProgressProjects: _state.inProgressProjects.filter(p => !sourceProjectIds.includes(p)),
  };
}),

on(recipientApiActions.deleteRecipientInitiated, (_state, { recipientId }) => {
  return {
    ..._state,
    inProgressRecipients: [
      ..._state.inProgressRecipients,
      recipientId,
    ],
  };
}),
on(recipientApiActions.deleteRecipientCompleted, recipientApiActions.deleteRecipientFailed, (_state, { recipientId }) => {
  return {
    ..._state,
    inProgressRecipients: _state.inProgressRecipients.filter(p => p !== recipientId),
  };
}),
on(recipientApiActions.mergeRecipientsInitiated, (_state, { sourceRecipientIds }) => {
  return {
    ..._state,
    inProgressRecipients: [
      ..._state.inProgressRecipients,
      ...sourceRecipientIds,
    ],
  };
}),
on(recipientApiActions.mergeRecipientsCompleted, recipientApiActions.mergeRecipientsFailed, (_state, { sourceRecipientIds }) => {
  return {
    ..._state,
    inProgressRecipients: _state.inProgressRecipients.filter(p => !sourceRecipientIds.includes(p)),
  };
}),

on(categoryApiActions.updateCategoryInitiated, (_state, { categoryId }) => {

  return {
    ..._state,
    inProgressCategories: [
      ..._state.inProgressCategories,
      categoryId,
    ],
  };
}),

on(categoryApiActions.deleteCategoryInitiated, (_state, { categoryId }) => {
  return {
    ..._state,
    inProgressCategories: [
      ..._state.inProgressCategories,
      categoryId,
    ],
  };
}),
on(categoryApiActions.deleteCategoryFailed, (_state, { categoryId }) => {
  return {
    ..._state,
    inProgressCategories: _state.inProgressCategories.filter(p => p !== categoryId),
  };
}),
on(categoryApiActions.mergeCategoriesInitiated, (_state, { sourceCategoryIds }) => {
  return {
    ..._state,
    inProgressCategories: [
      ..._state.inProgressCategories,
      ...sourceCategoryIds,
    ],
  };
}),
on(categoryApiActions.mergeCategoriesFailed, (_state, { sourceCategoryIds }) => {
  return {
    ..._state,
    inProgressCategories: _state.inProgressCategories.filter(p => !sourceCategoryIds.includes(p)),
  };
}),

on(categoryApiActions.listCategoriesCompleted, (_state) => {
  return {
    ..._state,
    inProgressCategories: [],
  };
}),

on(productApiActions.deleteProductInitiated, (_state, { productId }) => {
  return {
    ..._state,
    inProgressProducts: [
      ..._state.inProgressProducts,
      productId,
    ],
  };
}),
on(productApiActions.deleteProductCompleted, productApiActions.deleteProductFailed, (_state, { productId }) => {
  return {
    ..._state,
    inProgressProducts: _state.inProgressProducts.filter(p => p !== productId),
  };
}),

on(productApiActions.mergeProductsInitiated, (_state, { sourceProductIds }) => {
  return {
    ..._state,
    inProgressProducts: [
      ..._state.inProgressProducts,
      ...sourceProductIds,
    ],
  };
}),

on(productApiActions.mergeProductsCompleted, productApiActions.mergeProductsFailed, (_state, { sourceProductIds }) => {
  return {
    ..._state,
    inProgressProducts: _state.inProgressProducts.filter(p => !sourceProductIds.includes(p)),
  };
}),

on(accountApiActions.deleteAccountInitiated, (_state, { accountId }) => {
  return {
    ..._state,
    inProgressAccounts: [
      ..._state.inProgressAccounts,
      accountId,
    ],
  };
}),
on(accountApiActions.deleteAccountCompleted, accountApiActions.deleteAccountFailed, (_state, { accountId }) => {
  return {
    ..._state,
    inProgressAccounts: _state.inProgressAccounts.filter(p => p !== accountId),
  };
}),

on(transactionApiActions.deleteTransactionInitiated, (_state, { transactionId }) => {
  return {
    ..._state,
    inProgressTransactions: [
      ..._state.inProgressTransactions,
      transactionId,
    ],
  };
}),

on(transactionApiActions.deleteTransactionCompleted, transactionApiActions.deleteTransactionFailed, (_state, { transactionId }) => {
  return {
    ..._state,
    inProgressTransactions: _state.inProgressTransactions.filter(t => t !== transactionId),
  };
}),

on(fileApiActions.deleteFileInitiated, (_state, { fileId }) => {
  return {
    ..._state,
    inProgressFiles: [
      ..._state.inProgressFiles,
      fileId,
    ],
  };
}),

on(fileApiActions.deleteFileCompleted, fileApiActions.deleteFileFailed, (_state, { fileId }) => {
  return {
    ..._state,
    inProgressFiles: _state.inProgressFiles.filter(f => f !== fileId),
  };
}),

on(userApiActions.addUserToGroupInitiated, userApiActions.removeUserFromGroupInitiated, (_state, { group, email }) => {
  return {
    ..._state,
    inProgressUserGroups: [
      ..._state.inProgressUserGroups,
      `${email}_${group}`,
    ],
  };
}),

on(userApiActions.addUserToGroupCompleted, userApiActions.removeUserFromGroupCompleted, (_state, { group, email }) => {
  return {
    ..._state,
    inProgressUserGroups: _state.inProgressUserGroups.filter(x => x !== `${email}_${group}`),
  };
}),

on(hairdressingApiActions.deletePriceInitiated, (_state, { priceId }) => {
  return {
    ..._state,
    inProgressPrices: [
      ..._state.inProgressPrices,
      priceId,
    ],
  };
}),
on(hairdressingApiActions.deletePriceCompleted, hairdressingApiActions.deletePriceFailed, (_state, { priceId }) => {
  return {
    ..._state,
    inProgressPrices: _state.inProgressPrices.filter(p => p !== priceId),
  };
}),
);
