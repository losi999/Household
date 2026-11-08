import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectHome } from './project-home';
import { createStubComponent, elementSelectorFactory, IElementSelector, MockSignalStore, provideMockDispatcher, provideMockSignalStore } from '@household/shared-ui';
import { Toolbar } from '@household/app/shared/toolbar/toolbar';
import { ProjectList } from '@household/app/project/project-list/project-list';
import { ProjectStore } from '@household/state/project/project-store';
import { projectApiEvents, projectEvents } from '@household/state/project/project-events';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { validateFunctionCall } from '@household/shared/common/unit-testing';
import { Dispatcher } from '@ngrx/signals/events';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { Responses } from '@household/shared/types/responses';

describe('ProjectHome', () => {
  const ToolbarStub = createStubComponent(Toolbar);
  const ProjectListStub = createStubComponent(ProjectList);

  let fixture: ComponentFixture<ProjectHome>;
  let selector: IElementSelector;
  let mockProjectStore: MockSignalStore<typeof ProjectStore>;
  let mockDispatcher: Dispatcher;

  const projects = [
    testDataFactory.project.response(),
    testDataFactory.project.response(),
  ];

  const render = async (projectList: Responses.Project[] = projects) => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [ProjectHome],
      providers: [
        provideMockSignalStore(ProjectStore, 'projectList'),
        provideMockDispatcher(),
      ],
    })
      .overrideComponent(ProjectHome, {
        remove: {
          imports: [
            Toolbar,
            ProjectList,
          ],
        },
        add: {
          imports: [
            ToolbarStub,
            ProjectListStub,
          ],
        },
      })
      .compileComponents();

    mockProjectStore = TestBed.inject<MockSignalStore<typeof ProjectStore>>(ProjectStore);
    mockDispatcher = TestBed.inject(Dispatcher);

    mockProjectStore.projectList.set(projectList);

    fixture = TestBed.createComponent(ProjectHome);

    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  };

  describe('on init', () => {
    it('should dispatch listProjectsInitiated', async () => {
      await render();

      validateFunctionCall(mockDispatcher.dispatch, projectApiEvents.listProjectsInitiated(), {
        scope: 'self',
      });
    });
  });

  describe('toolbar', () => {
    it('should be rendered with the title', async () => {
      await render();

      expect(selector.getComponent<Toolbar>(ToolbarStub).componentInstance.title()).toBe('Projektek');
    });
  });

  describe('create button', () => {
    const getElement = () => {
      return selector.getComponent<MatIconButton, HTMLButtonElement>(MatIconButton, ToolbarStub);
    };

    it('should be rendered', async () => {
      await render();

      expect(selector.getComponent(MatIcon, ToolbarStub).nativeElement.textContent).toBe('add');
    });

    it('should dispatch createProject if clicked', async () => {
      await render();

      getElement().nativeElement.click();

      validateFunctionCall(mockDispatcher.dispatch, projectEvents.createProject(), {
        scope: 'self',
      });
    });
  });

  describe('project list', () => {
    it('should be rendered with the projects of the store', async () => {
      await render();

      expect(selector.getComponent<ProjectList>(ProjectListStub).componentInstance.projects()).toEqual(projects);
    });

    it('should be rendered with an empty list', async () => {
      await render([]);

      expect(selector.getComponent<ProjectList>(ProjectListStub).componentInstance.projects()).toEqual([]);
    });
  });
});
