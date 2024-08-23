import { Project } from '@household/shared/types/types';
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import {} from '@ngrx/effects';

export const projectApiActions = createActionGroup({
  source: 'Project API',
  events: {
    'Process project': props<Project.ProjectId>(),
    'Load projects': emptyProps(),
    'Projects loaded': props<{projects: Project.Response[]}>(),
    'Create project initiated': props<Project.Request>(),
    'Create project completed': props<Project.ProjectId & Project.Request>(),
    // 'Create project failed': props<Project.Request>(),
    'Merge projects': props<{
      sourceProjectIds: Project.Id[];
      targetProjectId: Project.Id;
    }>(),
    'Projects merged': props<{sourceProjectIds: Project.Id[]}>(),
    'Update project': props<Project.ProjectId & Project.Request>(),
    'Project updated': props<Project.ProjectId & Project.Request>(),
    'Delete project initiated': props<Project.ProjectId>(),
    'Delete project completed': props<Project.ProjectId>(),
    'Delete project failed': props<Project.ProjectId>(),
  },
});
