import { Clean } from '@household/shared/types/common';
import { Project } from '@household/shared/types/types';
import { createReducer, on } from '@ngrx/store';
import { projectApiActions } from 'src/app/state/project/project.actions';

export const projectReducer = createReducer<Clean<Project.Response>[]>([],
  on(projectApiActions.projectsLoaded, (_state, { projects }) => {
    return projects;
  }),
  on(projectApiActions.createProjectCompleted, (_state, { projectId, name, description }) => {

    return _state.concat({
      projectId,
      name,
      description,
    }).toSorted((a, b) => a.name.localeCompare(b.name, 'hu', {
      sensitivity: 'base',
    }));
  }),
  on(projectApiActions.projectUpdated, (_state, { projectId, name, description }) => {

    return [
      ..._state.filter(p => p.projectId !== projectId),
      {
        projectId,
        name,
        description,
      },
    ].sort((a, b) => a.name.localeCompare(b.name, 'hu', {
      sensitivity: 'base',
    }));
  }),
  on(projectApiActions.deleteProjectCompleted, (_state, { projectId }) => {
    return _state.filter(p => p.projectId !== projectId);
  }),
  on(projectApiActions.projectsMerged, (_state, { sourceProjectIds }) => {
    return _state.filter(p => !sourceProjectIds.includes(p.projectId));
  }),
);
