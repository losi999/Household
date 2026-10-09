import { TestBed } from '@angular/core/testing';
import { ProjectService } from '@household/services/project-service';
import { createDispatcherSpy, notificationEvents, validateDispatcher } from '@household/shared-ui';
import { Dispatcher } from '@ngrx/signals/events';
import { signalStore } from '@ngrx/signals';
import { Mock } from 'vitest';
import { createMockService, MockService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { projectApiEvents } from '@household/state/project/project-events';
import { withProjectApiEvents } from '@household/state/project/with-project-api-events';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { of, throwError } from 'rxjs';

describe('withProjectApiEvents', () => {
  let dispatcher: Dispatcher;
  let dispatchSpy: Mock;
  let mockProjectService: MockService<ProjectService>;

  const setup = () => {
    TestBed.resetTestingModule();

    mockProjectService = createMockService('listProjects', 'createProject', 'updateProject', 'deleteProject', 'mergeProjects');

    TestBed.configureTestingModule({
      providers: [
        {
          provide: ProjectService,
          useValue: mockProjectService.service,
        },
      ],
    });

    TestBed.inject(signalStore({
      providedIn: 'root',
    }, withProjectApiEvents()));
    dispatcher = TestBed.inject(Dispatcher);
    dispatchSpy = createDispatcherSpy(dispatcher);
  };

  beforeEach(() => {
    setup();
  });

  describe('dispatching listProjectsInitiated', () => {
    it('should call API and dispatch response', () => {
      const projectList = [testDataFactory.project.response()];
      mockProjectService.functions.listProjects.mockReturnValue(of(projectList));

      dispatcher.dispatch(projectApiEvents.listProjectsInitiated());

      expect(mockProjectService.functions.listProjects).toHaveBeenCalled();
      validateDispatcher(dispatchSpy, projectApiEvents.listProjectsCompleted(projectList));
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
    });
  });

  describe('dispatching updateProjectInitiated', () => {
    const projectRequest = testDataFactory.project.request();
    const projectId = testDataFactory.project.id();

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

      validateFunctionCall(mockProjectService.functions.updateProject, projectId, projectRequest);
      validateDispatcher(dispatchSpy, projectApiEvents.updateProjectFailed({
        projectId,
      }), notificationEvents.showMessage(`Projekt (${projectRequest.name}) már létezik!`));
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
    });
  });

  describe('dispatching deleteProjectInitiated', () => {
    const projectId = testDataFactory.project.id();

    it('should call API and dispatch response', () => {
      mockProjectService.functions.deleteProject.mockReturnValue(of(undefined));

      dispatcher.dispatch(projectApiEvents.deleteProjectInitiated({
        projectId,
      }));

      validateFunctionCall(mockProjectService.functions.deleteProject, projectId);
      validateDispatcher(dispatchSpy, projectApiEvents.deleteProjectCompleted({
        projectId,
      }));
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
    });
  });

  describe('dispatching mergeProjectsInitiated', () => {
    const targetProjectId = testDataFactory.project.id();
    const sourceProjectId = testDataFactory.project.id();

    it('should call API and dispatch response', () => {
      mockProjectService.functions.mergeProjects.mockReturnValue(of(undefined));

      dispatcher.dispatch(projectApiEvents.mergeProjectsInitiated({
        sourceProjectIds: [sourceProjectId],
        targetProjectId,
      }));

      validateFunctionCall(mockProjectService.functions.mergeProjects, targetProjectId, [sourceProjectId]);
      validateDispatcher(dispatchSpy, projectApiEvents.mergeProjectsCompleted({
        sourceProjectIds: [sourceProjectId],
      }));
    });

    it('should call API and show notification if there is an error', () => {
      mockProjectService.functions.mergeProjects.mockReturnValue(throwError(() => ({
        error: {
          message: 'There is an error',
        },
      })));

      dispatcher.dispatch(projectApiEvents.mergeProjectsInitiated({
        sourceProjectIds: [sourceProjectId],
        targetProjectId,
      }));

      validateFunctionCall(mockProjectService.functions.mergeProjects, targetProjectId, [sourceProjectId]);
      validateDispatcher(dispatchSpy, projectApiEvents.mergeProjectsFailed({
        sourceProjectIds: [sourceProjectId],
      }), notificationEvents.showMessage('Hiba történt'));
    });
  });
});
