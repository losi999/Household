import { TestBed } from '@angular/core/testing';
import { ProjectService } from '@household/services/project-service';
import { ProjectState, ProjectStore, provideProjectStoreInitialState } from '@household/state/project/project-store';
import { BottomSheetService, DialogService } from '@household/shared-ui';
import { Dispatcher } from '@ngrx/signals/events';
import { createMockService, MockService } from '@household/shared/common/unit-testing';
import { MatDialog } from '@angular/material/dialog';
import { projectApiEvents, projectEvents } from '@household/state/project/project-events';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { of } from 'rxjs';
import { ProjectDialog } from '@household/app/project/project-dialog/project-dialog';

// The behavior of each store feature is covered in its own spec (with-project-reducer.spec.ts,
// with-project-events.spec.ts, with-project-api-events.spec.ts). This spec only verifies that the store
// provides its initial state and has every feature wired in.
describe('Project store', () => {
  let initialState: ProjectState;
  let store: InstanceType<typeof ProjectStore>;
  let dispatcher: Dispatcher;
  let mockProjectService: MockService<ProjectService>;
  let mockDialogService: MockService<DialogService>;
  let mockMatDialog: MockService<MatDialog>;
  let mockBottomSheetService: MockService<BottomSheetService>;

  const setup = (initial?: Partial<ProjectState>) => {
    TestBed.resetTestingModule();

    initialState = {
      isInProgress: [],
      projectList: [],
      ...initial,
    };

    mockProjectService = createMockService('listProjects', 'createProject', 'updateProject', 'deleteProject', 'mergeProjects');
    mockDialogService = createMockService('openConfirmationDialog');
    mockBottomSheetService = createMockService('openBottomSubmenu');
    mockMatDialog = createMockService('open');

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
  };

  it('should initialize with the provided state', () => {
    const projectList = [
      {
        ...testDataFactory.project.response(),
        searchTerms: ['term'],
      },
    ];
    const isInProgress = [testDataFactory.project.id()];

    setup({
      projectList,
      isInProgress,
    });

    expect(store.projectList()).toEqual(projectList);
    expect(store.isInProgress()).toEqual(isInProgress);
  });

  it('should initialize with the default state', () => {
    setup();

    expect(store.projectList()).toEqual([]);
    expect(store.isInProgress()).toEqual([]);
  });

  it('should have the reducer wired in', () => {
    setup();
    const projectResponse = testDataFactory.project.response();

    dispatcher.dispatch(projectApiEvents.listProjectsCompleted([projectResponse]));

    expect(store.projectList()).toEqual([
      {
        ...projectResponse,
        searchTerms: expect.any(Array),
      },
    ]);
  });

  it('should have the UI event handlers wired in', () => {
    setup();
    mockMatDialog.functions.open.mockReturnValue({
      afterClosed: () => of(undefined),
    } as any);

    dispatcher.dispatch(projectEvents.createProject());

    expect(mockMatDialog.functions.open).toHaveBeenCalledWith(ProjectDialog, expect.anything());
  });

  it('should have the API event handlers and the reducer working together', () => {
    setup();
    const projectRequest = testDataFactory.project.request();
    const projectId = testDataFactory.project.id();
    mockProjectService.functions.createProject.mockReturnValue(of({
      projectId,
    }));

    dispatcher.dispatch(projectApiEvents.createProjectInitiated(projectRequest));

    expect(mockProjectService.functions.createProject).toHaveBeenCalledWith(projectRequest);
    expect(store.projectList()).toEqual([
      {
        projectId,
        ...projectRequest,
        searchTerms: expect.any(Array),
      },
    ]);
  });
});
