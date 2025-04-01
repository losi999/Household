import { File } from '@household/shared/types/types';
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import {} from '@ngrx/effects';

export const fileApiActions = createActionGroup({
  source: 'File API',
  events: {
    'List files initiated': emptyProps(),
    'List files completed': props<{files: File.Response[]}>(),
    'Upload import file initiated': props<File.Request & {file: any}>(),
    'Upload import file completed': emptyProps(),
    'Signed URL obtained': props<{url: string, file: any}>(),
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
