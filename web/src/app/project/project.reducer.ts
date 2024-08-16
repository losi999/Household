import { createReducer, on } from '@ngrx/store';
import { projectApiActions } from 'src/app/project/project.actions';

export const projectReducer = createReducer([],
  on(projectApiActions.retrievedProjectList, (_state, { projects }) => {
    return projects;
  }),
);
