import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, groupBy, map, mergeMap, of } from 'rxjs';
import { ProjectService } from '@household/web/services/project.service';
import { progressActions } from '@household/web/state/progress/progress.actions';
import { notificationActions } from '@household/web/state/notification/notification.actions';
import { FileService } from '@household/web/services/file.service';
import { fileApiActions } from '@household/web/state/file/file.actions';

@Injectable()
export class FileEffects {
  constructor(private actions: Actions, private fileService: FileService) {}

  // loadProjects = createEffect(() => {
  //   return this.actions.pipe(
  //     ofType(fileApiActions.listProjectsInitiated),
  //     exhaustMap(() => {
  //       return this.fileService.listProjects().pipe(
  //         map((projects) => fileApiActions.listProjectsCompleted({
  //           projects,
  //         })),
  //         catchError(() => {
  //           return of(progressActions.processFinished(),
  //             notificationActions.showMessage({
  //               message: 'Hiba történt',
  //             }),
  //           );
  //         }),
  //       );
  //     }),
  //   );
  // });

  createFileUpload = createEffect(() => {
    return this.actions.pipe(
      ofType(fileApiActions.createFileUploadURLInitiated),
      mergeMap(({ type, ...request }) => {
        return this.fileService.createFileUploadUrl().pipe(
          map(({ fileId, url }) => fileApiActions.createFileUploadURLCompleted({
            fileId,
            url,
          })),
          catchError((error) => {
            let errorMessage: string;
            switch(error.error?.message) {
              // case 'Duplicate project name': {
              //   errorMessage = `Projekt (${request.name}) már létezik!`;
              // } break;
              default: {
                errorMessage = 'Hiba történt';
              }
            }
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

  // updateProject = createEffect(() => {
  //   return this.actions.pipe(
  //     ofType(fileApiActions.updateProjectInitiated),
  //     groupBy(({ projectId }) => projectId),
  //     mergeMap((value) => {
  //       return value.pipe(exhaustMap(({ type, projectId, ...request }) => {
  //         return this.fileService.updateProject(projectId, request).pipe(
  //           map(({ projectId }) => fileApiActions.updateProjectCompleted({
  //             projectId,
  //             ...request,
  //           })),
  //           catchError((error) => {
  //             let errorMessage: string;
  //             switch(error.error?.message) {
  //               case 'Duplicate project name': {
  //                 errorMessage = `Projekt (${request.name}) már létezik!`;
  //               } break;
  //               default: {
  //                 errorMessage = 'Hiba történt';
  //               }
  //             }
  //             return of(progressActions.processFinished(),
  //               notificationActions.showMessage({
  //                 message: errorMessage,
  //               }),
  //             );
  //           }),
  //         );
  //       }));

  //     }),
  //   );
  // });

  // deleteProject = createEffect(() => {
  //   return this.actions.pipe(
  //     ofType(fileApiActions.deleteProjectInitiated),
  //     mergeMap(({ projectId }) => {
  //       return this.fileService.deleteProject(projectId).pipe(
  //         map(() => fileApiActions.deleteProjectCompleted({
  //           projectId,
  //         })),
  //         catchError(() => {
  //           return of(fileApiActions.deleteProjectFailed({
  //             projectId,
  //           }), progressActions.processFinished(),
  //           notificationActions.showMessage({
  //             message: 'Hiba történt',
  //           }),
  //           );
  //         }),
  //       );
  //     }),
  //   );
  // });

  // mergeProjects = createEffect(() => {
  //   return this.actions.pipe(
  //     ofType(fileApiActions.mergeProjectsInitiated),
  //     exhaustMap(({ sourceProjectIds, targetProjectId }) => {
  //       return this.fileService.mergeProjects(targetProjectId, sourceProjectIds).pipe(
  //         map(() => fileApiActions.mergeProjectsCompleted({
  //           sourceProjectIds,
  //         })),
  //         catchError(() => {
  //           return of(fileApiActions.mergeProjectsFailed({
  //             sourceProjectIds,
  //           }), progressActions.processFinished(),
  //           notificationActions.showMessage({
  //             message: 'Hiba történt',
  //           }),
  //           );
  //         }),
  //       );
  //     }),
  //   );
  // });
}

