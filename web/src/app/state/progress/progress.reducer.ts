import { Project } from '@household/shared/types/types';
import { createReducer, on } from '@ngrx/store';
import { progressActions } from 'src/app/state/progress/progress.actions';
import { projectApiActions } from 'src/app/state/project/project.actions';

export type ProgressState = {
  counter: number;
  projectsToRemove: Project.Id[];
};

export const progressReducer = createReducer<ProgressState>({
  counter: 0,
  projectsToRemove: [],
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
);
