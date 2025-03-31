import { File, Project } from '@household/shared/types/types';
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import {} from '@ngrx/effects';

export const fileApiActions = createActionGroup({
  source: 'File API',
  events: {
    // 'List projects initiated': emptyProps(),
    // 'List projects completed': props<{projects: Project.Response[]}>(),
    'Create file upload URL initiated': props<File.Request>(),
    'Create file upload URL completed': props<File.FileId & File.Url>(),
    // 'Merge projects initiated': props<{
    //   sourceProjectIds: Project.Id[];
    //   targetProjectId: Project.Id;
    // }>(),
    // 'Merge projects completed': props<{sourceProjectIds: Project.Id[]}>(),
    // 'Merge projects failed': props<{sourceProjectIds: Project.Id[]}>(),
    // 'Update project initiated': props<Project.ProjectId & Project.Request>(),
    // 'Update project completed': props<Project.ProjectId & Project.Request>(),
    // 'Delete project initiated': props<Project.ProjectId>(),
    // 'Delete project completed': props<Project.ProjectId>(),
    // 'Delete project failed': props<Project.ProjectId>(),
  },
});
