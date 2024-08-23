import { Project, Recipient } from '@household/shared/types/types';
import { createReducer, on } from '@ngrx/store';
import { progressActions } from 'src/app/state/progress/progress.actions';
import { projectApiActions } from 'src/app/state/project/project.actions';
import { recipientApiActions } from 'src/app/state/recipient/recipient.actions';

export type ProgressState = {
  counter: number;
  projectsToRemove: Project.Id[];
  recipientsToRemove: Recipient.Id[];
};

export const progressReducer = createReducer<ProgressState>({
  counter: 0,
  projectsToRemove: [],
  recipientsToRemove: [],
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
);
