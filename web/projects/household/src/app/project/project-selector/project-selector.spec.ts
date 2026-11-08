import { ComponentFixture, TestBed } from '@angular/core/testing';
import { elementSelectorFactory, IconText, IElementSelector, MockSignalStore, createStubComponent, ProgressStore, provideMockDispatcher, provideMockSignalStore, SelectionStore } from '@household/shared-ui';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { validateFunctionCall } from '@household/shared/common/unit-testing';
import { Responses } from '@household/shared/types/responses';
import { projectEvents } from '@household/state/project/project-events';
import { Dispatcher } from '@ngrx/signals/events';
import { ProjectSelector } from './project-selector';

describe('ProjectSelector', () => {
  const IconTextStub = createStubComponent(IconText);

  let fixture: ComponentFixture<ProjectSelector>;
  let selector: IElementSelector;
  let mockProgressStore: MockSignalStore<typeof ProgressStore>;
  let mockSelectionStore: MockSignalStore<typeof SelectionStore>;
  let mockDispatcher: Dispatcher;

  const label = 'Projekt';
  const project = testDataFactory.project.response();

  const getAddButton = () => selector.getElementByTestId('add-button');
  const getSelectButton = () => selector.getElementByTestId('select-button');
  const getMenuButton = () => selector.getElementByTestId('menu-button');
  const getIconText = () => selector.getComponent(IconTextStub);

  // The menu is rendered in the overlay, which is outside of the fixture
  const getMenuItem = (testId: string) => document.querySelector<HTMLElement>(`[data-testId="${testId}"]`);

  const render = async (params?: {
    value?: Responses.Project;
    required?: boolean;
    items?: Responses.Project[];
    isInProgress?: boolean;
  }) => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [ProjectSelector],
      providers: [
        provideMockSignalStore(ProgressStore, 'isInProgress'),
        provideMockSignalStore(SelectionStore, 'selectedItems'),
        provideMockDispatcher(),
      ],
    })
      .overrideComponent(ProjectSelector, {
        remove: {
          imports: [IconText], 
        },
        add: {
          imports: [IconTextStub], 
        },
      })
      .compileComponents();

    mockProgressStore = TestBed.inject<MockSignalStore<typeof ProgressStore>>(ProgressStore);
    mockSelectionStore = TestBed.inject<MockSignalStore<typeof SelectionStore>>(SelectionStore);
    mockDispatcher = TestBed.inject(Dispatcher);

    mockProgressStore.isInProgress.set(params?.isInProgress ?? false);
    mockSelectionStore.selectedItems.set({});

    fixture = TestBed.createComponent(ProjectSelector);
    fixture.componentRef.setInput('label', label);
    fixture.componentRef.setInput('required', params?.required ?? false);
    fixture.componentRef.setInput('items', params?.items ?? []);
    fixture.componentRef.setInput('value', params?.value);

    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  };

  describe('if nothing is selected', () => {
    it('should show the add button with the label', async () => {
      await render();

      expect(getAddButton().nativeElement.textContent).toContain(`${label} kiválasztása`);
      expect(getIconText()).toBeFalsy();
    });

    it('should start the selection from the given items when the add button is clicked', async () => {
      const items = [project];
      await render({
        items, 
      });

      getAddButton().nativeElement.click();

      validateFunctionCall(mockDispatcher.dispatch, projectEvents.selectProject({
        selectionId: expect.any(String),
        projects: items,
      }), {
        scope: 'self', 
      });
    });

    it('should use a different selection id for every selection', async () => {
      await render();

      getAddButton().nativeElement.click();
      getAddButton().nativeElement.click();

      const [
        first,
        second,
      ] = (mockDispatcher.dispatch as any).mock.calls.map(([event]) => event.payload.selectionId);
      expect(first).not.toBe(second);
    });
  });

  describe('if a project is selected', () => {
    it('should show the label and the name of the project', async () => {
      await render({
        value: project, 
      });

      expect(selector.getElementByCss('.label').nativeElement.textContent).toBe(label);
      expect(getIconText().componentInstance.text()).toBe(project.name);
      expect(getIconText().componentInstance.icon()).toBe('stacks');
      expect(getAddButton()).toBeFalsy();
    });

    describe('and it is required', () => {
      it('should show an edit button instead of the menu', async () => {
        await render({
          value: project,
          required: true, 
        });

        expect(getSelectButton()).toBeTruthy();
        expect(getMenuButton()).toBeFalsy();
      });

      it('should start the selection when the edit button is clicked', async () => {
        await render({
          value: project,
          required: true,
          items: [project], 
        });

        getSelectButton().nativeElement.click();

        validateFunctionCall(mockDispatcher.dispatch, projectEvents.selectProject({
          selectionId: expect.any(String),
          projects: [project],
        }), {
          scope: 'self', 
        });
      });
    });

    describe('and it is not required', () => {
      it('should show the menu instead of the edit button', async () => {
        await render({
          value: project, 
        });

        expect(getMenuButton()).toBeTruthy();
        expect(getSelectButton()).toBeFalsy();
      });

      it('should remove the project with the remove menu item', async () => {
        await render({
          value: project, 
        });

        getMenuButton().nativeElement.click();
        await fixture.whenStable();
        getMenuItem('remove-button').click();
        await fixture.whenStable();

        expect(fixture.componentInstance.value()).toBeNull();
      });

      it('should start the selection with the edit menu item', async () => {
        await render({
          value: project,
          items: [project], 
        });

        getMenuButton().nativeElement.click();
        await fixture.whenStable();
        getMenuItem('edit-button').click();

        validateFunctionCall(mockDispatcher.dispatch, projectEvents.selectProject({
          selectionId: expect.any(String),
          projects: [project],
        }), {
          scope: 'self', 
        });
      });
    });
  });

  describe('selection result', () => {
    it('should take the value from the selection store for the started selection', async () => {
      await render();
      getAddButton().nativeElement.click();
      const { selectionId } = (mockDispatcher.dispatch as any).mock.calls[0][0].payload;

      mockSelectionStore.selectedItems.set({
        [selectionId]: project,
      });
      await fixture.whenStable();

      expect(fixture.componentInstance.value()).toEqual(project);
      expect(getIconText().componentInstance.text()).toBe(project.name);
    });

    it('should ignore the selections of other selectors', async () => {
      await render();
      getAddButton().nativeElement.click();

      mockSelectionStore.selectedItems.set({
        'other-selection': project,
      });
      await fixture.whenStable();

      expect(fixture.componentInstance.value()).toBeUndefined();
    });
  });

  describe('loading', () => {
    it('should show the loading text instead of the buttons while a request is in progress', async () => {
      await render({
        isInProgress: true,
        value: project, 
      });

      expect(fixture.nativeElement.textContent).toContain('Loading');
      expect(getAddButton()).toBeFalsy();
      expect(getIconText()).toBeFalsy();
    });
  });
});
