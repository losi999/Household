import { File } from '@household/shared/types/types';
import { createFeatureSelector, createSelector } from '@ngrx/store';

export const selectFiles = createFeatureSelector<File.Response[]>('files');

export const selectFileById = (fileId: File.Id) => createSelector(selectFiles, (files) => {
  return files.find(a => a.fileId === fileId);
});
