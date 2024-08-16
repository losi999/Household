import { Project } from '@household/shared/types/types';
import { createActionGroup, props } from '@ngrx/store';

export const projectApiActions = createActionGroup({
  source: 'Project API',
  events: {
    'Retrieved project list': props<{projects: Project.Response[]}>(),
  },
});
