import { TestBed } from '@angular/core/testing';
import { Dispatcher } from '@ngrx/signals/events';
import { signalStore, withState } from '@ngrx/signals';
import { projectApiEvents } from '@household/state/project/project-events';
import { ProjectState } from '@household/state/project/project-store';
import { withProjectReducer } from '@household/state/project/with-project-reducer';
import { testDataFactory } from '@household/shared/common/test-data-factory';

const createTestStore = (state: ProjectState) => {
  return signalStore({
    providedIn: 'root',
  }, withState<ProjectState>(state), withProjectReducer());
};

describe('withProjectReducer', () => {
  let initialState: ProjectState;
  let store: InstanceType<ReturnType<typeof createTestStore>>;
  let dispatcher: Dispatcher;

  const validateState = (currentValue?: Partial<ProjectState>) => {
    expect(store.isInProgress(), 'isInProgress').toEqual(Object.hasOwn(currentValue ?? {}, 'isInProgress') ? currentValue.isInProgress : initialState.isInProgress);
    expect(store.projectList(), 'projectList').toEqual(Object.hasOwn(currentValue ?? {}, 'projectList') ? currentValue.projectList : initialState.projectList);
  };

  const setup = (initial?: Partial<ProjectState>) => {
    TestBed.resetTestingModule();

    initialState = {
      isInProgress: [],
      projectList: [],
      ...initial,
    };

    store = TestBed.inject(createTestStore(initialState));
    dispatcher = TestBed.inject(Dispatcher);
  };

  beforeEach(() => {
    setup();
  });

  describe('listProjectsCompleted', () => {
    it('should store the projects with their search terms', () => {
      const name = 'ékezetes név';
      const projectResponse = testDataFactory.project.response({
        name,
      });

      dispatcher.dispatch(projectApiEvents.listProjectsCompleted([projectResponse]));

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

  describe('createProjectCompleted', () => {
    it('should add the project with its search terms', () => {
      const name = 'ékezetes név';
      const projectId = testDataFactory.project.id();
      const projectRequest = testDataFactory.project.request({
        name,
      });

      dispatcher.dispatch(projectApiEvents.createProjectCompleted({
        projectId,
        ...projectRequest,
      }));

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

  describe('updateProjectInitiated', () => {
    it('should mark the project as in progress', () => {
      const originalProject = testDataFactory.project.response();
      const projectRequest = testDataFactory.project.request();

      setup({
        projectList: [originalProject],
      });

      dispatcher.dispatch(projectApiEvents.updateProjectInitiated({
        projectId: originalProject.projectId,
        ...projectRequest,
      }));

      validateState({
        isInProgress: [originalProject.projectId],
      });
    });
  });

  describe('updateProjectCompleted', () => {
    it('should replace the project and clear its in progress flag', () => {
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

  describe('updateProjectFailed', () => {
    it('should clear the in progress flag of the project', () => {
      const originalProject = testDataFactory.project.response();
      setup({
        isInProgress: [originalProject.projectId],
        projectList: [originalProject],
      });

      dispatcher.dispatch(projectApiEvents.updateProjectFailed({
        projectId: originalProject.projectId,
      }));

      validateState({
        isInProgress: [],
      });
    });
  });

  describe('deleteProjectInitiated', () => {
    it('should mark the project as in progress', () => {
      const originalProject = testDataFactory.project.response();

      setup({
        projectList: [originalProject],
      });

      dispatcher.dispatch(projectApiEvents.deleteProjectInitiated({
        projectId: originalProject.projectId,
      }));

      validateState({
        isInProgress: [originalProject.projectId],
      });
    });
  });

  describe('deleteProjectCompleted', () => {
    it('should remove the project and clear its in progress flag', () => {
      const originalProject = testDataFactory.project.response();
      setup({
        isInProgress: [originalProject.projectId],
        projectList: [originalProject],
      });

      dispatcher.dispatch(projectApiEvents.deleteProjectCompleted({
        projectId: originalProject.projectId,
      }));

      validateState({
        isInProgress: [],
        projectList: [],
      });
    });
  });

  describe('deleteProjectFailed', () => {
    it('should clear the in progress flag of the project', () => {
      const originalProject = testDataFactory.project.response();
      setup({
        isInProgress: [originalProject.projectId],
        projectList: [originalProject],
      });

      dispatcher.dispatch(projectApiEvents.deleteProjectFailed({
        projectId: originalProject.projectId,
      }));

      validateState({
        isInProgress: [],
      });
    });
  });

  describe('mergeProjectsInitiated', () => {
    it('should mark the source projects as in progress', () => {
      const targetProject = testDataFactory.project.response();
      const sourceProject = testDataFactory.project.response();

      setup({
        projectList: [
          targetProject,
          sourceProject,
        ],
      });

      dispatcher.dispatch(projectApiEvents.mergeProjectsInitiated({
        sourceProjectIds: [sourceProject.projectId],
        targetProjectId: targetProject.projectId,
      }));

      validateState({
        isInProgress: [sourceProject.projectId],
      });
    });
  });

  describe('mergeProjectsCompleted', () => {
    it('should remove the source projects and clear their in progress flags', () => {
      const sourceProject = testDataFactory.project.response();
      setup({
        isInProgress: [sourceProject.projectId],
        projectList: [sourceProject],
      });

      dispatcher.dispatch(projectApiEvents.mergeProjectsCompleted({
        sourceProjectIds: [sourceProject.projectId],
      }));

      validateState({
        isInProgress: [],
        projectList: [],
      });
    });
  });

  describe('mergeProjectsFailed', () => {
    it('should clear the in progress flags of the source projects', () => {
      const sourceProject = testDataFactory.project.response();
      setup({
        isInProgress: [sourceProject.projectId],
        projectList: [sourceProject],
      });

      dispatcher.dispatch(projectApiEvents.mergeProjectsFailed({
        sourceProjectIds: [sourceProject.projectId],
      }));

      validateState({
        isInProgress: [],
      });
    });
  });
});
