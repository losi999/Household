import { Searchable } from '@household/shared/types/common';
import { Api } from '@household/shared/types/api';
import { Responses } from '@household/shared/types/responses';
import { signalStore, withState } from '@ngrx/signals';
import { withProjectApiEvents } from '@household/state/project/with-project-api-events';
import { withProjectEvents } from '@household/state/project/with-project-events';
import { withProjectReducer } from '@household/state/project/with-project-reducer';
import { inject, ValueProvider, InjectionToken } from '@angular/core';

const PROJECT_STORE_INITIAL_STATE = new InjectionToken<ProjectState>('PROJECT_STORE_INITIAL_STATE');

export type ProjectState = {
  projectList: Searchable<Responses.Project>[];
  isInProgress: Api.Project.Id[];
};

export const provideProjectStoreInitialState = (state: ProjectState = {
  isInProgress: [],
  projectList: [],
}): ValueProvider => {
  return {
    provide: PROJECT_STORE_INITIAL_STATE,
    useValue: state,
  };
};

export const ProjectStore = signalStore({
  providedIn: 'root',
}, 
withState<ProjectState>(() => {
  const initialState = inject(PROJECT_STORE_INITIAL_STATE);

  return initialState;
}),
withProjectReducer(),
withProjectApiEvents(),
withProjectEvents(),
);
