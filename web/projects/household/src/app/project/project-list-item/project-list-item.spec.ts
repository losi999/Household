import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectListItem } from './project-list-item';
import { elementSelectorFactory, IElementSelector, MockSignalStore, provideMockDispatcher, provideMockSignalStore } from '@household/shared-ui';
import { projectEvents } from '@household/state/project/project-events';
import { ProjectStore } from '@household/state/project/project-store';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { validateFunctionCall } from '@household/shared/common/unit-testing';
import { Dispatcher } from '@ngrx/signals/events';
import { MatListItem, MatListItemLine, MatListItemTitle } from '@angular/material/list';
import { Api } from '@household/shared/types/api';

describe('ProjectListItem', () => {
  let fixture: ComponentFixture<ProjectListItem>;
  let selector: IElementSelector;
  let mockProjectStore: MockSignalStore<typeof ProjectStore>;
  let mockDispatcher: Dispatcher;

  const project = testDataFactory.project.response();

  const render = async (isInProgress: Api.Project.Id[] = []) => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [ProjectListItem],
      providers: [
        provideMockSignalStore(ProjectStore, 'isInProgress'),
        provideMockDispatcher(),
      ],
    })
      .compileComponents();

    mockProjectStore = TestBed.inject<MockSignalStore<typeof ProjectStore>>(ProjectStore);
    mockDispatcher = TestBed.inject(Dispatcher);

    mockProjectStore.isInProgress.set(isInProgress);

    fixture = TestBed.createComponent(ProjectListItem);
    fixture.componentRef.setInput('project', project);

    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  };

  describe('list item button', () => {
    const getElement = () => {
      return selector.getComponent<MatListItem, HTMLButtonElement>(MatListItem);
    };

    it('should be rendered', async () => {
      await render();

      expect(getElement()).toBeTruthy();
    });

    it('should be enabled if project is not in progress', async () => {
      await render([testDataFactory.project.id()]);

      expect(getElement().nativeElement.disabled).toBe(false);
    });

    it('should be disabled if project is in progress', async () => {
      await render([project.projectId]);

      expect(getElement().nativeElement.disabled).toBe(true);
    });

    describe('on click', () => {
      it('should dispatch openProjectListItemSubmenu', async () => {
        await render();

        getElement().nativeElement.click();

        validateFunctionCall(mockDispatcher.dispatch, projectEvents.openProjectListItemSubmenu(project), {
          scope: 'self',
        });
      });

      it('should not dispatch anything if disabled', async () => {
        await render([project.projectId]);

        getElement().nativeElement.click();

        validateFunctionCall(mockDispatcher.dispatch);
      });
    });
  });

  describe('name', () => {
    it('should be rendered', async () => {
      await render();

      expect(selector.getComponent(MatListItemTitle, MatListItem).nativeElement.textContent).toBe(project.name);
    });
  });

  describe('description', () => {
    it('should be rendered', async () => {
      await render();

      expect(selector.getComponent(MatListItemLine, MatListItem).nativeElement.textContent).toBe(project.description);
    });
  });
});
