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
    'Delete file initiated': props<File.FileId>(),
    'Delete file completed': props<File.FileId>(),
    'Delete file failed': props<File.FileId>(),
  },
});
