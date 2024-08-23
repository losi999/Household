import { Project } from '@household/shared/types/types';
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProgressState } from 'src/app/state/progress/progress.reducer';

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
