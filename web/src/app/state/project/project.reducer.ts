import { Clean } from '@household/shared/types/common';
import { Project } from '@household/shared/types/types';
import { createReducer, on } from '@ngrx/store';
import { projectApiActions } from 'src/app/state/project/project.actions';

export const projectReducer = createReducer<Clean<Project.Response>[]>([],
  on(projectApiActions.listProjectsCompleted, (_state, { projects }) => {
    return projects;
  }),
  on(projectApiActions.createProjectCompleted, projectApiActions.updateProjectCompleted, (_state, { projectId, name, description }) => {

    return _state.filter(p => p.projectId !== projectId)
      .concat({
        projectId,
        name,
        description,
      })
      .toSorted((a, b) => a.name.localeCompare(b.name, 'hu', {
        sensitivity: 'base',
      }));
  }),
  on(projectApiActions.deleteProjectCompleted, (_state, { projectId }) => {
    return _state.filter(p => p.projectId !== projectId);
  }),
  on(projectApiActions.mergeProjectsCompleted, (_state, { sourceProjectIds }) => {
    return _state.filter(p => !sourceProjectIds.includes(p.projectId));
  }),
);
