// The dialogs opened by the event handlers import the store, which imports the event handlers back. Loading the store
// first resolves that cycle in the same order as the application does.
import '@household/state/project/project-store';
import { TestBed } from '@angular/core/testing';
import { BottomSheetService, createDispatcherSpy, DialogService, validateDispatcher } from '@household/shared-ui';
import { Dispatcher } from '@ngrx/signals/events';
import { signalStore } from '@ngrx/signals';
import { Mock } from 'vitest';
import { createMockService, MockService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { projectApiEvents, projectEvents } from '@household/state/project/project-events';
import { withProjectEvents } from '@household/state/project/with-project-events';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { of } from 'rxjs';
import { ProjectDialog } from '@household/app/project/project-dialog/project-dialog';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { ProjectMergeDialog } from '@household/app/project/project-merge-dialog/project-merge-dialog';

describe('withProjectEvents', () => {
  let dispatcher: Dispatcher;
  let dispatchSpy: Mock;
  let mockDialogService: MockService<DialogService>;
  let mockMatDialog: MockService<MatDialog>;
  let mockBottomSheetService: MockService<BottomSheetService>;

  const setup = () => {
    TestBed.resetTestingModule();

    mockDialogService = createMockService('openConfirmationDialog');
    mockBottomSheetService = createMockService('openBottomSubmenu');
    mockMatDialog = createMockService('open');

    TestBed.configureTestingModule({
      providers: [
        {
          provide: MatDialog,
          useValue: mockMatDialog.service,
        },
        {
          provide: DialogService,
          useValue: mockDialogService.service,
        },
        {
          provide: BottomSheetService,
          useValue: mockBottomSheetService.service,
        },
      ],
    });

    TestBed.inject(signalStore({
      providedIn: 'root',
    }, withProjectEvents()));
    dispatcher = TestBed.inject(Dispatcher);
    dispatchSpy = createDispatcherSpy(dispatcher);
  };

  beforeEach(() => {
    setup();
  });

  describe('dispatching createProject', () => {
    it('should open dialog and dispatch if submitted', () => {
      const projectRequest = testDataFactory.project.request();

      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of(projectRequest),
      } as MatDialogRef<any>);

      dispatcher.dispatch(projectEvents.createProject());

      validateFunctionCall(mockMatDialog.functions.open, ProjectDialog, {
        disableClose: true,
      });
      validateDispatcher(dispatchSpy, projectApiEvents.createProjectInitiated(projectRequest));
    });

    it('should open dialog and not dispatch anything if cancelled', () => {
      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of(undefined),
      } as MatDialogRef<any>);

      dispatcher.dispatch(projectEvents.createProject());

      validateFunctionCall(mockMatDialog.functions.open, ProjectDialog, {
        disableClose: true,
      });
      validateDispatcher(dispatchSpy);
    });
  });

  describe('dispatching updateProject', () => {
    const projectId = testDataFactory.project.id();
    const projectRequest = testDataFactory.project.request();
    const projectResponse = testDataFactory.project.response({
      projectId,
    });

    it('should open dialog and dispatch if submitted', () => {
      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of(projectRequest),
      } as MatDialogRef<any>);

      dispatcher.dispatch(projectEvents.updateProject(projectResponse));

      validateFunctionCall(mockMatDialog.functions.open, ProjectDialog, {
        disableClose: true,
        data: projectResponse,
      });
      validateDispatcher(dispatchSpy, projectApiEvents.updateProjectInitiated({
        ...projectRequest,
        projectId,
      }));
    });

    it('should open dialog and not dispatch anything if cancelled', () => {
      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of(undefined),
      } as MatDialogRef<any>);

      dispatcher.dispatch(projectEvents.updateProject(projectResponse));

      validateFunctionCall(mockMatDialog.functions.open, ProjectDialog, {
        disableClose: true,
        data: projectResponse,
      });
      validateDispatcher(dispatchSpy);
    });
  });

  describe('dispatching deleteProject', () => {
    const projectResponse = testDataFactory.project.response();

    it('should open dialog and dispatch if confirmed', () => {
      mockDialogService.functions.openConfirmationDialog.mockReturnValue(of(true));

      dispatcher.dispatch(projectEvents.deleteProject(projectResponse));

      validateFunctionCall(mockDialogService.functions.openConfirmationDialog, {
        title: 'Törölni akarod ezt a projektet?',
        content: projectResponse.name,
      });
      validateDispatcher(dispatchSpy, projectApiEvents.deleteProjectInitiated({
        projectId: projectResponse.projectId,
      }));
    });

    it('should open dialog and not dispatch anything if cancelled', () => {
      mockDialogService.functions.openConfirmationDialog.mockReturnValue(of(false));

      dispatcher.dispatch(projectEvents.deleteProject(projectResponse));

      validateFunctionCall(mockDialogService.functions.openConfirmationDialog, {
        title: 'Törölni akarod ezt a projektet?',
        content: projectResponse.name,
      });
      validateDispatcher(dispatchSpy);
    });
  });

  describe('dispatching mergeProjects', () => {
    const projectResponse = testDataFactory.project.response();
    const sourceProjectId = testDataFactory.project.id();

    it('should open dialog and dispatch if submitted', () => {
      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of({
          sourceProjectIds: [sourceProjectId],
          targetProjectId: projectResponse.projectId,
        }),
      } as MatDialogRef<any>);

      dispatcher.dispatch(projectEvents.mergeProjects(projectResponse));

      validateFunctionCall(mockMatDialog.functions.open, ProjectMergeDialog, {
        disableClose: true,
        data: projectResponse,
        height: '80vh',
        width: '90vw',
      });
      validateDispatcher(dispatchSpy, projectApiEvents.mergeProjectsInitiated({
        sourceProjectIds: [sourceProjectId],
        targetProjectId: projectResponse.projectId,
      }));
    });

    it('should open dialog and not dispatch anything if cancelled', () => {
      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of(undefined),
      } as MatDialogRef<any>);

      dispatcher.dispatch(projectEvents.mergeProjects(projectResponse));

      validateFunctionCall(mockMatDialog.functions.open, ProjectMergeDialog, {
        disableClose: true,
        data: projectResponse,
        height: '80vh',
        width: '90vw',
      });
      validateDispatcher(dispatchSpy);
    });
  });

  describe('dispatching openProjectListItemSubmenu', () => {
    const projectResponse = testDataFactory.project.response();

    it('should open bottom sheet and dispatch if edit is selected', () => {
      mockBottomSheetService.functions.openBottomSubmenu.mockReturnValue({
        afterDismissed: () => of('edit'),
      } as MatBottomSheetRef);

      dispatcher.dispatch(projectEvents.openProjectListItemSubmenu(projectResponse));

      validateFunctionCall(mockBottomSheetService.functions.openBottomSubmenu, projectResponse.name, 'edit', 'merge', 'delete');
      validateDispatcher(dispatchSpy, projectEvents.updateProject(projectResponse));
    });

    it('should open bottom sheet and dispatch if merge is selected', () => {
      mockBottomSheetService.functions.openBottomSubmenu.mockReturnValue({
        afterDismissed: () => of('merge'),
      } as MatBottomSheetRef);

      dispatcher.dispatch(projectEvents.openProjectListItemSubmenu(projectResponse));

      validateFunctionCall(mockBottomSheetService.functions.openBottomSubmenu, projectResponse.name, 'edit', 'merge', 'delete');
      validateDispatcher(dispatchSpy, projectEvents.mergeProjects(projectResponse));
    });

    it('should open bottom sheet and dispatch if delete is selected', () => {
      mockBottomSheetService.functions.openBottomSubmenu.mockReturnValue({
        afterDismissed: () => of('delete'),
      } as MatBottomSheetRef);

      dispatcher.dispatch(projectEvents.openProjectListItemSubmenu(projectResponse));

      validateFunctionCall(mockBottomSheetService.functions.openBottomSubmenu, projectResponse.name, 'edit', 'merge', 'delete');
      validateDispatcher(dispatchSpy, projectEvents.deleteProject(projectResponse));
    });

    it('should open bottom sheet and not dispatch anything if cancelled', () => {
      mockBottomSheetService.functions.openBottomSubmenu.mockReturnValue({
        afterDismissed: () => of(undefined),
      } as MatBottomSheetRef);

      dispatcher.dispatch(projectEvents.openProjectListItemSubmenu(projectResponse));

      validateFunctionCall(mockBottomSheetService.functions.openBottomSubmenu, projectResponse.name, 'edit', 'merge', 'delete');
      validateDispatcher(dispatchSpy);
    });
  });
});
