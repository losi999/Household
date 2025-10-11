import { Account, Category, File, Price, Product, Project, Recipient, Transaction, User } from '@household/shared/types/types';
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProgressState } from '@household/web/state/progress/progress.reducer';

const selectProgress = createFeatureSelector<ProgressState>('progress');

export const selectIsInProgress = createSelector(
  selectProgress, ({ counter }) => {
    return counter > 0;
  },
);

export const selectProjectIsInProgress = (projectId: Project.Id) => createSelector(
  selectProgress, ({ inProgressProjects }) => {
    return inProgressProjects.includes(projectId);
  },
);

export const selectProductIsInProgress = (productId: Product.Id) => createSelector(
  selectProgress, ({ inProgressProducts }) => {
    return inProgressProducts.includes(productId);
  },
);

export const selectAccountIsInProgress = (accountId: Account.Id) => createSelector(
  selectProgress, ({ inProgressAccounts }) => {
    return inProgressAccounts.includes(accountId);
  },
);

export const selectRecipientIsInProgress = (recipientId: Recipient.Id) => createSelector(
  selectProgress, ({ inProgressRecipients }) => {
    return inProgressRecipients.includes(recipientId);
  },
);

export const selectCategoryIsInProgress = (category: Category.Response) => createSelector(
  selectProgress, ({ inProgressCategories }) => {
    const categoryIds = [
      ...category.ancestors.map(a => a.categoryId),
      category.categoryId,
    ];
    return categoryIds.some(id => inProgressCategories.includes(id));
  },
);

export const selectTransactionIsInProgress = (transactionId: Transaction.Id) => createSelector(
  selectProgress, ({ inProgressTransactions }) => {
    return inProgressTransactions.includes(transactionId);
  });

export const selectFileIsInProgress = (fileId: File.Id) => createSelector(
  selectProgress, ({ inProgressFiles }) => {
    return inProgressFiles.includes(fileId);
  });

export const selectUserGroupIsInProgress = ({ email, group }: User.Email & User.Group) => createSelector(selectProgress, ({ inProgressUserGroups }) => {
  return inProgressUserGroups.includes(`${email}_${group}`);
});

export const selectPriceIsInProgress = (priceId: Price.Id) => createSelector(
  selectProgress, ({ inProgressPrices }) => {
    return inProgressPrices.includes(priceId);
  },
);
