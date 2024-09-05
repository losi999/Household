import { Category, Product, Project, Recipient } from '@household/shared/types/types';
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProgressState } from '@household/web/state/progress/progress.reducer';

const selectProgress = createFeatureSelector<ProgressState>('progress');

export const selectIsInProgress = createSelector(
  selectProgress, ({ counter }) => {
    return counter > 0;
  },
);

export const selectProjectIsInProgress = (projectId: Project.Id) => createSelector(
  selectProgress, ({ projectsToRemove }) => {
    return projectsToRemove.includes(projectId);
  },
);

export const selectProductIsInProgress = (productId: Product.Id) => createSelector(
  selectProgress, ({ inProgressProducts }) => {
    return inProgressProducts.includes(productId);
  },
);

export const selectRecipientIsInProgress = (recipientId: Recipient.Id) => createSelector(
  selectProgress, ({ recipientsToRemove }) => {
    return recipientsToRemove.includes(recipientId);
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
