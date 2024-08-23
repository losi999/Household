import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, groupBy, map, mergeMap, of } from 'rxjs';
import { projectApiActions } from 'src/app/state/project/project.actions';
import { ProjectService } from 'src/app/project/project.service';
import { progressActions } from 'src/app/state/progress/progress.actions';
import { notificationActions } from 'src/app/state/notification/notification.action';

@Injectable()
export class ProjectEffects {
  constructor(private actions: Actions, private projectService: ProjectService) {}

  loadProjects = createEffect(() => {
    return this.actions.pipe(
      ofType(projectApiActions.listProjectsInitiated),
      exhaustMap(() => {
        return this.projectService.listProjects().pipe(
          map((projects) => projectApiActions.listProjectsCompleted({
            projects,
          })),
          catchError(() => {
            return of(progressActions.processFinished(),
              notificationActions.showError({
                message: 'Hiba történt',
              }),
            );
          }),
        );
      }),
    );
  });

  createProject = createEffect(() => {
    return this.actions.pipe(
      ofType(projectApiActions.createProjectInitiated),
      mergeMap(({ type, ...request }) => {
        return this.projectService.createProject(request).pipe(
          map(({ projectId }) => projectApiActions.createProjectCompleted({
            projectId,
            ...request,
          })),
          catchError((error) => {
            let errorMessage: string;
            switch(error.error?.message) {
              case 'Duplicate project name': {
                errorMessage = `Projekt név (${request.name}) már foglalt!`;
              } break;
              default: {
                errorMessage = 'Hiba történt';
              }
            }
            return of(progressActions.processFinished(),
              notificationActions.showError({
                message: errorMessage,
              }),
            );
          }),
        );
      }),
    );
  });

  updateProject = createEffect(() => {
    return this.actions.pipe(
      ofType(projectApiActions.updateProjectInitiated),
      groupBy(({ projectId }) => projectId),
      mergeMap((value) => {
        return value.pipe(exhaustMap(({ type, projectId, ...request }) => {
          return this.projectService.updateProject(projectId, request).pipe(
            map(({ projectId }) => projectApiActions.updateProjectCompleted({
              projectId,
              ...request,
            })),
            catchError((error) => {
              let errorMessage: string;
              switch(error.error?.message) {
                case 'Duplicate project name': {
                  errorMessage = `Projekt név (${request.name}) már foglalt!`;
                } break;
                default: {
                  errorMessage = 'Hiba történt';
                }
              }
              return of(progressActions.processFinished(),
                notificationActions.showError({
                  message: errorMessage,
                }),
              );
            }),
          );
        }));

      }),
    );
  });

  deleteProject = createEffect(() => {
    return this.actions.pipe(
      ofType(projectApiActions.deleteProjectInitiated),
      mergeMap(({ projectId }) => {
        return this.projectService.deleteProject(projectId).pipe(
          map(() => projectApiActions.deleteProjectCompleted({
            projectId,
          })),
          catchError(() => {
            return of(projectApiActions.deleteProjectFailed({
              projectId,
            }), progressActions.processFinished(),
            notificationActions.showError({
              message: 'Hiba történt',
            }),
            );
          }),
        );
      }),
    );
  });

  mergeProjects = createEffect(() => {
    return this.actions.pipe(
      ofType(projectApiActions.mergeProjectsInitiated),
      exhaustMap(({ sourceProjectIds, targetProjectId }) => {
        return this.projectService.mergeProjects(targetProjectId, sourceProjectIds).pipe(
          map(() => projectApiActions.mergeProjectsCompleted({
            sourceProjectIds,
          })),
          catchError(() => {
            return of(projectApiActions.mergeProjectsFailed({
              sourceProjectIds,
            }), progressActions.processFinished(),
            notificationActions.showError({
              message: 'Hiba történt',
            }),
            );
          }),
        );
      }),
    );
  });
}

