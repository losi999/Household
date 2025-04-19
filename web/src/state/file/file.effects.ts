import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, mergeMap, of } from 'rxjs';
import { progressActions } from '@household/web/state/progress/progress.actions';
import { notificationActions } from '@household/web/state/notification/notification.actions';
import { FileService } from '@household/web/services/file.service';
import { fileApiActions } from '@household/web/state/file/file.actions';

@Injectable()
export class FileEffects {
  constructor(private actions: Actions, private fileService: FileService) {}

  refreshList = createEffect(() => {
    return this.actions.pipe(
      ofType(fileApiActions.uploadImportFileCompleted, fileApiActions.deleteFileCompleted),
      map(() => fileApiActions.listFilesInitiated()),
    );
  });

  loadFiles = createEffect(() => {
    return this.actions.pipe(
      ofType(fileApiActions.listFilesInitiated),
      exhaustMap(() => {
        return this.fileService.listFiles().pipe(
          map((files) => fileApiActions.listFilesCompleted({
            files,
          })),
          catchError(() => {
            return of(progressActions.processFinished(),
              notificationActions.showMessage({
                message: 'Hiba történt',
              }),
            );
          }),
        );
      }),
    );
  });

  createUploadUrl = createEffect(() => {
    return this.actions.pipe(
      ofType(fileApiActions.uploadImportFileInitiated),
      mergeMap(({ type, file, ...request }) => {
        return this.fileService.createFileUploadUrl(request).pipe(
          map(({ url }) => fileApiActions.signedURLObtained({
            url,
            file,
          })),
          catchError(() => {
            const errorMessage = 'Hiba történt';
            return of(progressActions.processFinished(),
              notificationActions.showMessage({
                message: errorMessage,
              }),
            );
          }),
        );
      }),
    );
  });

  uploadFile = createEffect(() => {
    return this.actions.pipe(
      ofType(fileApiActions.signedURLObtained),
      mergeMap(({ file, url }) => {
        return this.fileService.uploadFile(url, file).pipe(
          map(() => fileApiActions.uploadImportFileCompleted()),
          catchError(() => {
            const errorMessage = 'Hiba történt';
            return of(progressActions.processFinished(),
              notificationActions.showMessage({
                message: errorMessage,
              }),
            );
          }),
        );
      }),
    );
  });

  deleteFile = createEffect(() => {
    return this.actions.pipe(
      ofType(fileApiActions.deleteFileInitiated),
      mergeMap(({ fileId }) => {
        return this.fileService.deleteFile(fileId).pipe(
          map(() => fileApiActions.deleteFileCompleted({
            fileId,
          })),
          catchError(() => {
            return of(fileApiActions.deleteFileFailed({
              fileId,
            }), progressActions.processFinished(),
            notificationActions.showMessage({
              message: 'Hiba történt',
            }),
            );
          }),
        );
      }),
    );
  });
}

