import { inject } from '@angular/core';
import { ProjectService } from '@household/services/project-service';
import { projectApiEvents } from '@household/state/project/project-events';
import { notificationEvents } from '@household/shared-ui';
import { signalStoreFeature } from '@ngrx/signals';
import { Events, withEventHandlers } from '@ngrx/signals/events';
import { catchError, exhaustMap, groupBy, map, mergeMap } from 'rxjs';

export const withProjectApiEvents = () => {
  return signalStoreFeature(
    withEventHandlers(() => {
      const events = inject(Events);
      const projectService = inject(ProjectService);

      return {
        listProjects: events.on(projectApiEvents.listProjectsInitiated).pipe(
          exhaustMap(() => {
            return projectService.listProjects().pipe(
              map((projects) => projectApiEvents.listProjectsCompleted(projects)),
              catchError(() => {
                return [notificationEvents.showMessage('Hiba történt')];
              }),
            );
          }),
        ),
        createProject: events.on(projectApiEvents.createProjectInitiated).pipe(
          mergeMap(({ payload }) => {
            return projectService.createProject(payload).pipe(
              map(({ projectId }) => projectApiEvents.createProjectCompleted({
                projectId,
                ...payload,
              })),
              catchError((error) => {
                let errorMessage: string;
                switch(error.error?.message) {
                  case 'Duplicate project name': {
                    errorMessage = `Árlista elem (${payload.name}) már létezik!`;
                  } break;
                  default: {
                    errorMessage = 'Hiba történt';
                  }
                }
                return [notificationEvents.showMessage(errorMessage)];
              }),
            );
          }),
        ),
        updateProject: events.on(projectApiEvents.updateProjectInitiated).pipe(
          groupBy(({ payload }) => payload.projectId),
          mergeMap((value) => {
            return value.pipe(exhaustMap(({ payload: { projectId, ...request } }) => {
              return projectService.updateProject(projectId, request).pipe(
                map(() => projectApiEvents.updateProjectCompleted({
                  projectId,
                  ...request,
                })),
                catchError((error) => {
                  let errorMessage: string;
                  switch(error.error?.message) {
                    case 'Duplicate project name': {
                      errorMessage = `Árlista elem (${request.name}) már létezik!`;
                    } break;
                    default: {
                      errorMessage = 'Hiba történt';
                    }
                  }
                  return [
                    projectApiEvents.updateProjectFailed({
                      projectId,
                    }),
                    notificationEvents.showMessage(errorMessage),
                  ];
                }),
              );
            }));
          }),
        ),
        deleteProject: events.on(projectApiEvents.deleteProjectInitiated).pipe(
          mergeMap(({ payload: { projectId } }) => {
            return projectService.deleteProject(projectId).pipe(
              map(() => projectApiEvents.deleteProjectCompleted({
                projectId,
              })),
              catchError(() => {
                return [
                  projectApiEvents.deleteProjectFailed({
                    projectId,
                  }), 
                  notificationEvents.showMessage('Hiba történt'),
                ];
              }),
            );
          }),    
        ),
        mergeProjects: events.on(projectApiEvents.mergeProjectsInitiated).pipe(
          mergeMap(({ payload: { targetProjectId, sourceProjectIds } }) => {
            return projectService.mergeProjects(targetProjectId, sourceProjectIds).pipe(
              map(() => projectApiEvents.mergeProjectsCompleted({
                sourceProjectIds,
              })),
              catchError(() => {
                return [
                  projectApiEvents.mergeProjectsFailed({
                    sourceProjectIds,
                  }), 
                  notificationEvents.showMessage('Hiba történt'),
                ];
              }),
            );
          }),
        ),
      };
    }),
  );
};
