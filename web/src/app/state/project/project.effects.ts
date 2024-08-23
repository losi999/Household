import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, groupBy, map, mergeMap, of } from 'rxjs';
import { projectApiActions } from 'src/app/state/project/project.actions';
import { ProjectService } from 'src/app/project/project.service';
import { progressActions } from 'src/app/state/progress.actions';
import { notificationActions } from 'src/app/state/notification/notification.action';

@Injectable()
export class ProjectEffects {
  constructor(private actions: Actions, private projectService: ProjectService) {}

  loadProjects = createEffect(() => {
    return this.actions.pipe(
      ofType(projectApiActions.loadProjects),
      exhaustMap(() => {
        return this.projectService.listProjects_().pipe(
          map((projects) => projectApiActions.projectsLoaded({
            projects,
          })),
        );
      }),
    );
  });

  createProject = createEffect(() => {
    return this.actions.pipe(
      ofType(projectApiActions.createProjectInitiated),
      mergeMap(({ type, ...request }) => {
        return this.projectService.createProject_(request).pipe(
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
      ofType(projectApiActions.updateProject),
      groupBy(({ projectId }) => projectId),
      mergeMap((value) => {
        return value.pipe(exhaustMap(({ type, projectId, ...request }) => {
          return this.projectService.updateProject_(projectId, request).pipe(
            map(({ projectId }) => projectApiActions.projectUpdated({
              projectId,
              ...request,
            })),
          );
        }));

      }),
    );
  });

  deleteProject = createEffect(() => {
    return this.actions.pipe(
      ofType(projectApiActions.deleteProjectInitiated),
      mergeMap(({ projectId }) => {
        return this.projectService.deleteProject_(projectId).pipe(
          map(() => projectApiActions.deleteProjectCompleted({
            projectId,
          })),
          catchError((error) => {
            console.log(error.error);
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
      ofType(projectApiActions.mergeProjects),
      exhaustMap(({ sourceProjectIds, targetProjectId }) => {
        return this.projectService.mergeProjects_(targetProjectId, sourceProjectIds).pipe(
          map(() => projectApiActions.projectsMerged({
            sourceProjectIds,
          })),
        );
      }),
    );
  });
}

