import { File } from '@household/shared/types/types';
import { createReducer, on } from '@ngrx/store';
import { fileApiActions } from '@household/web/state/file/file.actions';

export const fileReducer = createReducer<File.Response[]>([],
  on(fileApiActions.listFilesCompleted, (_state, { files }) => {
    return files;
  }),
  on(fileApiActions.deleteFileCompleted, (_state, { fileId }) => {
    return _state.filter(p => p.fileId !== fileId);
  }),
);
