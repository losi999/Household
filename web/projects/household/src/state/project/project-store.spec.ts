import { TestBed } from '@angular/core/testing';
import { ProjectService } from '@household/services/project-service';
import { ProjectState, ProjectStore, provideProjectStoreInitialState } from '@household/state/project/project-store';
import { BottomSheetService, createDispatcherSpy, DialogService, notificationEvents, validateDispatcher } from '@household/shared-ui';
import { Dispatcher } from '@ngrx/signals/events';
import { Mock } from 'vitest';
import { createMockService, MockService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { projectApiEvents, projectEvents } from '@household/state/project/project-events';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { of, throwError } from 'rxjs';
import { ProjectDialog } from '@household/app/project/project-dialog/project-dialog';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { Api } from '@household/shared/types/api';
import { Requests } from '@household/shared/types/requests';
import { Responses } from '@household/shared/types/responses';
import { ProjectMergeDialog } from '@household/app/project/project-merge-dialog/project-merge-dialog';

describe('Project store', () => {
  let initialState: ProjectState; 
  let store: InstanceType<typeof ProjectStore>;
  let dispatcher: Dispatcher;
  let dispatchSpy: Mock;
  let mockProjectService: MockService<ProjectService>;
  let mockDialogService: MockService<DialogService>;
  let mockMatDialog: MockService<MatDialog>;
  let mockBottomSheetService: MockService<BottomSheetService>;

  const validateState = (currentValue?: Partial<ProjectState>) => {
    expect(store.isInProgress(), 'isInProgress').toEqual(currentValue?.isInProgress ?? initialState.isInProgress);
    expect(store.projectList(), 'projectList').toEqual(currentValue?.projectList ?? initialState.projectList);
  };

  const setup = (initial?: Partial<ProjectState>) => {
    TestBed.resetTestingModule();
    initialState = {
      isInProgress: [],
      projectList: [],
      ...initial,
    };

    TestBed.configureTestingModule({
      providers: [
        {
          provide: ProjectService,
          useValue: mockProjectService.service,
        },
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
        provideProjectStoreInitialState(initialState),
      ],
    });

    store = TestBed.inject(ProjectStore);
    dispatcher = TestBed.inject(Dispatcher);
    dispatchSpy = createDispatcherSpy(dispatcher);
  };

  beforeEach(() => {
    mockProjectService = createMockService('listProjects', 'createProject', 'updateProject', 'deleteProject', 'mergeProjects');
    mockDialogService = createMockService('openConfirmationDialog');
    mockBottomSheetService = createMockService('openBottomSubmenu');  
    mockMatDialog = createMockService('open');

    setup();
  });

  it('should initialize', () => {
    validateState();
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
      validateState();
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
      validateState();
    });
  });

  describe('dispatching updateProject', () => {
    const projectId = testDataFactory.project.id();
    const projectRequest = testDataFactory.project.request();
    it('should open dialog and dispatch if submitted', () => {
      
      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of(projectRequest),
      } as MatDialogRef<any>);

      dispatcher.dispatch(projectEvents.updateProject({
        projectId,
        ...projectRequest,
      })); 

      validateFunctionCall(mockMatDialog.functions.open, ProjectDialog, {
        disableClose: true,
        data: {
          projectId,
          ...projectRequest,
        },
      });
      validateDispatcher(dispatchSpy, projectApiEvents.updateProjectInitiated({
        ...projectRequest,
        projectId,
      }));
      validateState();
    });

    it('should open dialog and not dispatch anything if cancelled', () => {    
      mockMatDialog.functions.open.mockReturnValue({
        afterClosed: () => of(undefined),
      } as MatDialogRef<any>);

      dispatcher.dispatch(projectEvents.updateProject({
        projectId,
        ...projectRequest,
      })); 

      validateFunctionCall(mockMatDialog.functions.open, ProjectDialog, {
        disableClose: true,
        data: {
          projectId,
          ...projectRequest,
        },
      });
      validateDispatcher(dispatchSpy);
      validateState();
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
      validateState();
    });

    it('should open dialog and not dispatch anything if cancelled', () => {    
      mockDialogService.functions.openConfirmationDialog.mockReturnValue(of(false));

      dispatcher.dispatch(projectEvents.deleteProject(projectResponse)); 

      validateFunctionCall(mockDialogService.functions.openConfirmationDialog, {
        title: 'Törölni akarod ezt a projektet?',
        content: projectResponse.name,
      });
      validateDispatcher(dispatchSpy);
      validateState();
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
      validateState();
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
      validateState();
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
      validateState();
    });

    it('should open bottom sheet and dispatch if merge is selected', () => {
      mockBottomSheetService.functions.openBottomSubmenu.mockReturnValue({
        afterDismissed: () => of('merge'),
      } as MatBottomSheetRef);

      dispatcher.dispatch(projectEvents.openProjectListItemSubmenu(projectResponse)); 

      validateFunctionCall(mockBottomSheetService.functions.openBottomSubmenu, projectResponse.name, 'edit', 'merge', 'delete');
      validateDispatcher(dispatchSpy, projectEvents.mergeProjects(projectResponse));
      validateState();
    });

    it('should open bottom sheet and dispatch if delete is selected', () => {
      mockBottomSheetService.functions.openBottomSubmenu.mockReturnValue({
        afterDismissed: () => of('delete'),
      } as MatBottomSheetRef);

      dispatcher.dispatch(projectEvents.openProjectListItemSubmenu(projectResponse)); 

      validateFunctionCall(mockBottomSheetService.functions.openBottomSubmenu, projectResponse.name, 'edit', 'merge', 'delete');
      validateDispatcher(dispatchSpy, projectEvents.deleteProject(projectResponse));
      validateState();
    });

    it('should open bottom sheet and not dispatch anything if cancelled', () => {
      mockBottomSheetService.functions.openBottomSubmenu.mockReturnValue({
        afterDismissed: () => of(undefined),
      } as MatBottomSheetRef);

      dispatcher.dispatch(projectEvents.openProjectListItemSubmenu(projectResponse)); 

      validateFunctionCall(mockBottomSheetService.functions.openBottomSubmenu, projectResponse.name, 'edit', 'merge', 'delete');
      validateDispatcher(dispatchSpy);
      validateState();
    });
  });
  
  describe('dispatching listProjectsInitiated', () => {
    it('should call API and dispatch response', () => {
      const projectList = [testDataFactory.project.response()];
      mockProjectService.functions.listProjects.mockReturnValue(of(projectList));

      dispatcher.dispatch(projectApiEvents.listProjectsInitiated());

      expect(mockProjectService.functions.listProjects).toHaveBeenCalled();
      validateDispatcher(dispatchSpy, projectApiEvents.listProjectsCompleted(projectList));
      validateState();
    });

    it('should call API and show notification if there is an error', () => {
      mockProjectService.functions.listProjects.mockReturnValue(throwError(() => ({
        error: {
          message: 'There is an error',
        },
      })));

      dispatcher.dispatch(projectApiEvents.listProjectsInitiated());

      expect(mockProjectService.functions.listProjects).toHaveBeenCalled();
      validateDispatcher(dispatchSpy, notificationEvents.showMessage('Hiba történt'));
      validateState();
    });
  });

  describe('dispatching listProjectsCompleted', () => {
    it('should update store', () => {
      const name = 'ékezetes név';
      const projectResponse = testDataFactory.project.response({
        name,
      });

      dispatcher.dispatch(projectApiEvents.listProjectsCompleted([projectResponse]));
      
      validateDispatcher(dispatchSpy);    
      validateState({
        projectList: [
          {
            ...projectResponse,
            searchTerms: expect.arrayContaining([
              'ekezetes',
              'nev',
              'ékezetes',
              'név',
            ]),
          },
        ],
      });
    });
  });

  describe('dispatching createProjectInitiated', () => {
    const projectRequest = testDataFactory.project.request();
    const projectId = testDataFactory.project.id();

    it('should call API and dispatch response', () => {
      mockProjectService.functions.createProject.mockReturnValue(of({
        projectId,
      }));

      dispatcher.dispatch(projectApiEvents.createProjectInitiated(projectRequest));

      validateFunctionCall(mockProjectService.functions.createProject, projectRequest);
      validateDispatcher(dispatchSpy, projectApiEvents.createProjectCompleted({
        projectId,
        ...projectRequest, 
      }));
      validateState();
    });

    it('should call API and show notification if project name is already taken', () => {
      mockProjectService.functions.createProject.mockReturnValue(throwError(() => ({
        error: {
          message: 'Duplicate project name',
        },
      })));

      dispatcher.dispatch(projectApiEvents.createProjectInitiated(projectRequest));

      validateFunctionCall(mockProjectService.functions.createProject, projectRequest);
      validateDispatcher(dispatchSpy, notificationEvents.showMessage(`Projekt (${projectRequest.name}) már létezik!`));
      validateState();
    });

    it('should call API and show notification if there is an error', () => {
      mockProjectService.functions.createProject.mockReturnValue(throwError(() => ({
        error: {
          message: 'There is an error',
        },
      })));

      dispatcher.dispatch(projectApiEvents.createProjectInitiated(projectRequest));

      validateFunctionCall(mockProjectService.functions.createProject, projectRequest);
      validateDispatcher(dispatchSpy, notificationEvents.showMessage('Hiba történt'));
      validateState();
    });
  });

  describe('dispatching createProjectCompleted', () => {
    it('should update store', () => {
      const name = 'ékezetes név';
      const projectId = testDataFactory.project.id();
      const projectRequest = testDataFactory.project.request({
        name,
      });

      dispatcher.dispatch(projectApiEvents.createProjectCompleted({
        projectId,
        ...projectRequest,
      }));

      validateDispatcher(dispatchSpy);
      validateState({
        projectList: [
          {
            projectId,
            ...projectRequest,
            searchTerms: expect.arrayContaining([
              'ekezetes',
              'nev',
              'ékezetes',
              'név',
            ]),
          },
        ],
      });
    });
  });

  describe('dispatching updateProjectInitiated', () => {
    let projectRequest: Requests.Project;
    let projectId: Api.Project.Id;
    let originalProject: Responses.Project;

    beforeEach(() => {
      projectRequest = testDataFactory.project.request();
      originalProject = testDataFactory.project.response();
      projectId = originalProject.projectId;

      setup({
        projectList: [originalProject],
      });
    });

    it('should call API and dispatch response', () => {
      mockProjectService.functions.updateProject.mockReturnValue(of(undefined));

      dispatcher.dispatch(projectApiEvents.updateProjectInitiated({
        projectId,
        ...projectRequest, 
      }));

      validateFunctionCall(mockProjectService.functions.updateProject, projectId, projectRequest);
      validateDispatcher(dispatchSpy, projectApiEvents.updateProjectCompleted({
        projectId,
        ...projectRequest, 
      }));
      validateState({
        isInProgress: [projectId],
      });
    });

    it('should call API and show notification if project name is already taken', () => {
      mockProjectService.functions.updateProject.mockReturnValue(throwError(() => ({
        error: {
          message: 'Duplicate project name',
        },
      })));

      dispatcher.dispatch(projectApiEvents.updateProjectInitiated({
        projectId,
        ...projectRequest, 
      }));
      
      validateDispatcher(dispatchSpy, projectApiEvents.updateProjectFailed({
        projectId,
      }), notificationEvents.showMessage(`Projekt (${projectRequest.name}) már létezik!`));
      validateState({
        isInProgress: [projectId],
      });

    });

    it('should call API and show notification if there is an error', () => {
      mockProjectService.functions.updateProject.mockReturnValue(throwError(() => ({
        error: {
          message: 'There is an error',
        },
      })));

      dispatcher.dispatch(projectApiEvents.updateProjectInitiated({
        projectId,
        ...projectRequest, 
      }));

      validateFunctionCall(mockProjectService.functions.updateProject, projectId, projectRequest);
      validateDispatcher(dispatchSpy, projectApiEvents.updateProjectFailed({
        projectId,
      }), notificationEvents.showMessage('Hiba történt'));
      validateState({
        isInProgress: [projectId],
      });
    });
  });

  describe('dispatching updateProjectCompleted', () => {
    it('should update store', () => {
      const originalProject = testDataFactory.project.response();
      setup({
        isInProgress: [originalProject.projectId],
        projectList: [originalProject],
      });

      const name = 'ékezetes név';
      const projectRequest = testDataFactory.project.request({
        name,
      });

      dispatcher.dispatch(projectApiEvents.updateProjectCompleted({
        projectId: originalProject.projectId,
        ...projectRequest,
      }));

      validateDispatcher(dispatchSpy);
      validateState({
        isInProgress: [],
        projectList: [
          {
            projectId: originalProject.projectId,
            ...projectRequest,
            searchTerms: expect.arrayContaining([
              'ekezetes',
              'nev',
              'ékezetes',
              'név',
            ]),
          },
        ],
      });
    });
  });

  describe('dispatching updateProjectFailed', () => {
    it('should update store', () => {
      const originalProject = testDataFactory.project.response();
      setup({
        isInProgress: [originalProject.projectId],
        projectList: [originalProject],
      });

      dispatcher.dispatch(projectApiEvents.updateProjectFailed({
        projectId: originalProject.projectId,
      }));

      validateDispatcher(dispatchSpy);
      validateState({
        isInProgress: [],
      });
    });
  });

  describe('dispatching deleteProjectInitiated', () => {
    let originalProject: Responses.Project;
    let projectId: Api.Project.Id;
    
    beforeEach(() => {
      originalProject = testDataFactory.project.response();
      projectId = originalProject.projectId;

      setup({
        projectList: [originalProject],
      });
    });

    it('should call API and dispatch response', () => {
      mockProjectService.functions.deleteProject.mockReturnValue(of(undefined));

      dispatcher.dispatch(projectApiEvents.deleteProjectInitiated({
        projectId, 
      }));

      validateFunctionCall(mockProjectService.functions.deleteProject, projectId);
      validateDispatcher(dispatchSpy, projectApiEvents.deleteProjectCompleted({
        projectId,
      }));
      validateState({
        isInProgress: [projectId],
      });
    });

    it('should call API and show notification if there is an error', () => {
      mockProjectService.functions.deleteProject.mockReturnValue(throwError(() => ({
        error: {
          message: 'There is an error',
        },
      })));

      dispatcher.dispatch(projectApiEvents.deleteProjectInitiated({
        projectId, 
      }));

      validateFunctionCall(mockProjectService.functions.deleteProject, projectId);
      validateDispatcher(dispatchSpy, projectApiEvents.deleteProjectFailed({
        projectId,
      }), notificationEvents.showMessage('Hiba történt'));
      validateState({
        isInProgress: [projectId],
      });
    });
  });

  describe('dispatching deleteProjectCompleted', () => {
    it('should update store', () => {
      const originalProject = testDataFactory.project.response();
      setup({
        isInProgress: [originalProject.projectId],
        projectList: [originalProject],
      });
      const projectRequest = testDataFactory.project.request();

      dispatcher.dispatch(projectApiEvents.deleteProjectCompleted({
        projectId: originalProject.projectId,
        ...projectRequest,
      }));

      validateDispatcher(dispatchSpy);
      validateState({
        isInProgress: [],
        projectList: [],
      });
    });
  });

  describe('dispatching deleteProjectFailed', () => {
    it('should update store', () => {
      const originalProject = testDataFactory.project.response();
      setup({
        isInProgress: [originalProject.projectId],
        projectList: [originalProject],
      });

      dispatcher.dispatch(projectApiEvents.deleteProjectFailed({
        projectId: originalProject.projectId,
      }));

      validateDispatcher(dispatchSpy);
      validateState({
        isInProgress: [],
      });
    });
  });

  describe('dispatching mergeProjectInitiated', () => {
    let targetProject: Responses.Project;
    let sourceProject: Responses.Project;
    
    beforeEach(() => {
      targetProject = testDataFactory.project.response();
      sourceProject = testDataFactory.project.response();

      setup({
        projectList: [
          targetProject,
          sourceProject,
        ],
      });
    });

    it('should call API and dispatch response', () => {
      mockProjectService.functions.mergeProjects.mockReturnValue(of(undefined));

      dispatcher.dispatch(projectApiEvents.mergeProjectsInitiated({
        sourceProjectIds: [sourceProject.projectId],
        targetProjectId: targetProject.projectId,
      }));

      validateFunctionCall(mockProjectService.functions.mergeProjects, targetProject.projectId, [sourceProject.projectId]);
      validateDispatcher(dispatchSpy, projectApiEvents.mergeProjectsCompleted({
        sourceProjectIds: [sourceProject.projectId],
      }));
      validateState({
        isInProgress: [sourceProject.projectId],
      });
    });

    it('should call API and show notification if there is an error', () => {
      mockProjectService.functions.mergeProjects.mockReturnValue(throwError(() => ({
        error: {
          message: 'There is an error',
        },
      })));

      dispatcher.dispatch(projectApiEvents.mergeProjectsInitiated({
        sourceProjectIds: [sourceProject.projectId],
        targetProjectId: targetProject.projectId,
      }));

      validateFunctionCall(mockProjectService.functions.mergeProjects, targetProject.projectId, [sourceProject.projectId]);
      validateDispatcher(dispatchSpy, projectApiEvents.mergeProjectsFailed({
        sourceProjectIds: [sourceProject.projectId],
      }), notificationEvents.showMessage('Hiba történt'));
      validateState({
        isInProgress: [sourceProject.projectId],
      });
    });
  });

  describe('dispatching mergeProjectCompleted', () => {
    it('should update store', () => {
      const sourceProject = testDataFactory.project.response();
      setup({
        isInProgress: [sourceProject.projectId],
        projectList: [sourceProject],
      });

      dispatcher.dispatch(projectApiEvents.mergeProjectsCompleted({
        sourceProjectIds: [sourceProject.projectId],
      }));

      validateDispatcher(dispatchSpy);
      validateState({
        isInProgress: [],
        projectList: [],
      });
    });
  });

  describe('dispatching mergeProjectFailed', () => {
    it('should update store', () => {
      const sourceProject = testDataFactory.project.response();
      setup({
        isInProgress: [sourceProject.projectId],
        projectList: [sourceProject],
      });

      dispatcher.dispatch(projectApiEvents.mergeProjectsFailed({
        sourceProjectIds: [sourceProject.projectId],
      }));

      validateDispatcher(dispatchSpy);
      validateState({
        isInProgress: [],
      });
    });
  });
});
