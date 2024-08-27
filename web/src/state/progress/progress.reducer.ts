import { Category, Project, Recipient } from '@household/shared/types/types';
import { createReducer, on } from '@ngrx/store';
import { categoryApiActions } from '@household/web/state/category/category.actions';
import { progressActions } from '@household/web/state/progress/progress.actions';
import { projectApiActions } from '@household/web/state/project/project.actions';
import { recipientApiActions } from '@household/web/state/recipient/recipient.actions';

export type ProgressState = {
  counter: number;
  projectsToRemove: Project.Id[];
  categoriesToRemove: Category.Id[];
  recipientsToRemove: Recipient.Id[];
};

export const progressReducer = createReducer<ProgressState>({
  counter: 0,
  projectsToRemove: [],
  recipientsToRemove: [],
  categoriesToRemove: [],
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
    projectsToRemove: [
      ..._state.projectsToRemove,
      projectId,
    ],
  };
}),
on(projectApiActions.deleteProjectCompleted, projectApiActions.deleteProjectFailed, (_state, { projectId }) => {
  return {
    ..._state,
    projectsToRemove: _state.projectsToRemove.filter(p => p !== projectId),
  };
}),
on(projectApiActions.mergeProjectsInitiated, (_state, { sourceProjectIds }) => {
  return {
    ..._state,
    projectsToRemove: [
      ..._state.projectsToRemove,
      ...sourceProjectIds,
    ],
  };
}),
on(projectApiActions.mergeProjectsCompleted, projectApiActions.mergeProjectsFailed, (_state, { sourceProjectIds }) => {
  return {
    ..._state,
    projectsToRemove: _state.projectsToRemove.filter(p => !sourceProjectIds.includes(p)),
  };
}),

on(recipientApiActions.deleteRecipientInitiated, (_state, { recipientId }) => {
  return {
    ..._state,
    recipientsToRemove: [
      ..._state.recipientsToRemove,
      recipientId,
    ],
  };
}),
on(recipientApiActions.deleteRecipientCompleted, recipientApiActions.deleteRecipientFailed, (_state, { recipientId }) => {
  return {
    ..._state,
    recipientsToRemove: _state.recipientsToRemove.filter(p => p !== recipientId),
  };
}),
on(recipientApiActions.mergeRecipientsInitiated, (_state, { sourceRecipientIds }) => {
  return {
    ..._state,
    recipientsToRemove: [
      ..._state.recipientsToRemove,
      ...sourceRecipientIds,
    ],
  };
}),
on(recipientApiActions.mergeRecipientsCompleted, recipientApiActions.mergeRecipientsFailed, (_state, { sourceRecipientIds }) => {
  return {
    ..._state,
    recipientsToRemove: _state.recipientsToRemove.filter(p => !sourceRecipientIds.includes(p)),
  };
}),

on(categoryApiActions.deleteCategoryInitiated, (_state, { categoryId }) => {
  return {
    ..._state,
    categoriesToRemove: [
      ..._state.categoriesToRemove,
      categoryId,
    ],
  };
}),
on(categoryApiActions.deleteCategoryCompleted, categoryApiActions.deleteCategoryFailed, (_state, { categoryId }) => {
  return {
    ..._state,
    categoriesToRemove: _state.categoriesToRemove.filter(p => p !== categoryId),
  };
}),
on(categoryApiActions.mergeCategoriesInitiated, (_state, { sourceCategoryIds }) => {
  return {
    ..._state,
    categoriesToRemove: [
      ..._state.categoriesToRemove,
      ...sourceCategoryIds,
    ],
  };
}),
on(categoryApiActions.mergeCategoriesCompleted, categoryApiActions.mergeCategoriesFailed, (_state, { sourceCategoryIds }) => {
  return {
    ..._state,
    categoriesToRemove: _state.categoriesToRemove.filter(p => !sourceCategoryIds.includes(p)),
  };
}),
);
