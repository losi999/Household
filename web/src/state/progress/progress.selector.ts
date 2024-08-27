import { Category, Project, Recipient } from '@household/shared/types/types';
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

export const selectRecipientIsInProgress = (recipientId: Recipient.Id) => createSelector(
  selectProgress, ({ recipientsToRemove }) => {
    return recipientsToRemove.includes(recipientId);
  },
);

export const selectCategoryIsInProgress = (categoryId: Category.Id) => createSelector(
  selectProgress, ({ categoriesToRemove }) => {
    return categoriesToRemove.includes(categoryId);
  },
);
