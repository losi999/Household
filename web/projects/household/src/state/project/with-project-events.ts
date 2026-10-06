import { inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ProjectDialog, ProjectDialogData, ProjectDialogResult } from '@household/app/project/project-dialog/project-dialog';
import { projectApiEvents, projectEvents } from '@household/state/project/project-events';
import { DialogService, BottomSheetService, dispatchIfConfirmed } from '@household/shared-ui';
import { signalStoreFeature } from '@ngrx/signals';
import { Events, withEventHandlers } from '@ngrx/signals/events';
import { exhaustMap, filter, map } from 'rxjs';
import { ProjectMergeDialog, ProjectMergeDialogData, ProjectMergeDialogResult } from '@household/app/project/project-merge-dialog/project-merge-dialog';

export const withProjectEvents = () => {
  return signalStoreFeature(
    withEventHandlers(() => {

      const events = inject(Events);
      const dialog = inject(MatDialog);
      const dialogService = inject(DialogService);
      const bottomSheetService = inject(BottomSheetService);

      return {
        openCreateProjectDialog: events.on(projectEvents.createProject)
          .pipe(
            exhaustMap(() => {
              return dialog.open<ProjectDialog, ProjectDialogData, ProjectDialogResult>(ProjectDialog, {
                disableClose: true,
              }).afterClosed();
            }),
            filter(req => !!req),
            map((request) => {
              return projectApiEvents.createProjectInitiated(request);
            }),
          ),
        openUpdateProjectDialog: events.on(projectEvents.updateProject).pipe(
          exhaustMap(({ payload }) => {
            return dialog.open<ProjectDialog, ProjectDialogData, ProjectDialogResult>(ProjectDialog, {
              data: payload,
              disableClose: true,
            }).afterClosed()
              .pipe(filter(req => !!req),
                map((request) => {
                  return projectApiEvents.updateProjectInitiated({
                    projectId: payload.projectId,
                    ...request,
                  });
                }));
          }),    
        ),
        openDeleteProjectDialog: events.on(projectEvents.deleteProject).pipe(
          exhaustMap(({ payload }) => {
            return dialogService.openConfirmationDialog({
              title: 'Törölni akarod ezt a projektet?',
              content: payload.name,
            }).pipe(
              dispatchIfConfirmed(projectApiEvents.deleteProjectInitiated({
                projectId: payload.projectId,
              })),
            );
          }),
        ),
        openProjectListItemSubmenu: events.on(projectEvents.openProjectListItemSubmenu)
          .pipe(
            exhaustMap(({ payload }) => {
              return bottomSheetService.openBottomSubmenu(payload.name, 'edit', 'merge', 'delete')
                .afterDismissed()
                .pipe(
                  filter(value => !!value),
                  map((value) => {
                    switch(value) {
                      case 'edit': return projectEvents.updateProject(payload);
                      case 'delete': return projectEvents.deleteProject(payload);
                      case 'merge': return projectEvents.mergeProjects(payload);
                    }
                  }),
                );
            }),
          ),
        openMergeProjectsDialog: events.on(projectEvents.mergeProjects)
          .pipe(
            exhaustMap(({ payload }) => {
              return dialog.open<ProjectMergeDialog, ProjectMergeDialogData, ProjectMergeDialogResult>(ProjectMergeDialog, {
                disableClose: true,
                data: payload,
                width: '90vw',
                height: '80vh',
              }).afterClosed();
            }),
            filter(req => !!req),
            map((request) => {
              return projectApiEvents.mergeProjectsInitiated(request);
            }),
          ),
      };
    },
    ),
  );
};
