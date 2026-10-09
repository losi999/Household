import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectMergeDialog, ProjectMergeDialogData } from './project-merge-dialog';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { elementSelectorFactory, IElementSelector, MockSignalStore, provideMockSignalStore } from '@household/shared-ui';
import { ProjectStore } from '@household/state/project/project-store';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { createMockService, MockService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { MatActionList, MatListItem } from '@angular/material/list';
import { MatChip, MatChipSet } from '@angular/material/chips';
import { Responses } from '@household/shared/types/responses';

describe('ProjectMergeDialog', () => {
  let fixture: ComponentFixture<ProjectMergeDialog>;
  let selector: IElementSelector;
  let mockProjectStore: MockSignalStore<typeof ProjectStore>;
  let mockDialogRef: MockService<MatDialogRef<ProjectMergeDialog>>;

  const targetProject: ProjectMergeDialogData = testDataFactory.project.response();
  const sourceProject1 = testDataFactory.project.response();
  const sourceProject2 = testDataFactory.project.response();

  const getListItems = () => {
    return selector.listComponents<MatListItem, HTMLButtonElement>(MatListItem, MatActionList);
  };

  const getChips = () => {
    return selector.listComponents<MatChip, HTMLElement>(MatChip, MatChipSet);
  };

  const getSaveButton = () => {
    return selector.getElementByTestId<HTMLButtonElement>('save-button', MatDialogActions);
  };

  const render = async (params?: {
    dialogData?: ProjectMergeDialogData;
    projectList?: Responses.Project[];
  }) => {
    TestBed.resetTestingModule();

    mockDialogRef = createMockService('close');

    await TestBed.configureTestingModule({
      imports: [ProjectMergeDialog],
      providers: [
        provideMockSignalStore(ProjectStore, 'projectList'),
        {
          provide: MAT_DIALOG_DATA,
          useValue: params?.dialogData ?? targetProject,
        },
        {
          provide: MatDialogRef,
          useValue: mockDialogRef.service,
        },
      ],
    })
      .compileComponents();

    mockProjectStore = TestBed.inject<MockSignalStore<typeof ProjectStore>>(ProjectStore);
    mockProjectStore.projectList.set(params?.projectList ?? [
      targetProject,
      sourceProject1,
      sourceProject2,
    ]);

    fixture = TestBed.createComponent(ProjectMergeDialog);

    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  };

  describe('dialog title', () => {
    it('should display the name of the merge target project', async () => {
      await render();

      expect(selector.getComponent(MatDialogTitle).nativeElement.textContent).toContain(targetProject.name);
    });
  });

  describe('selectable project list', () => {
    it('should display every project except the merge target', async () => {
      await render();

      const listItems = getListItems();

      expect(listItems.length).toBe(2);
      expect(listItems[0].nativeElement.textContent.trim()).toBe(sourceProject1.name);
      expect(listItems[1].nativeElement.textContent.trim()).toBe(sourceProject2.name);
    });

    it('should display nothing if the merge target is the only project', async () => {
      await render({
        projectList: [targetProject],
      });

      expect(getListItems().length).toBe(0);
    });

    describe('on click', () => {
      it('should select the project and remove it from the list', async () => {
        await render();

        getListItems()[0].nativeElement.click();

        await fixture.whenStable();

        const listItems = getListItems();
        expect(listItems.length).toBe(1);
        expect(listItems[0].nativeElement.textContent.trim()).toBe(sourceProject2.name);
        expect(fixture.componentInstance.selectedProjects()).toEqual([sourceProject1]);
      });
    });
  });

  describe('selected project chips', () => {
    it('should not be rendered by default', async () => {
      await render();

      expect(getChips().length).toBe(0);
    });

    it('should be rendered for each selected project', async () => {
      await render();

      getListItems()[0].nativeElement.click();
      await fixture.whenStable();

      getListItems()[0].nativeElement.click();
      await fixture.whenStable();

      const chips = getChips();
      expect(chips.length).toBe(2);
      expect(chips[0].nativeElement.textContent).toContain(sourceProject1.name);
      expect(chips[1].nativeElement.textContent).toContain(sourceProject2.name);
    });

    describe('on click', () => {
      it('should deselect the project and put it back to the list', async () => {
        await render();

        getListItems()[0].nativeElement.click();
        await fixture.whenStable();

        getChips()[0].nativeElement.click();
        await fixture.whenStable();

        expect(getChips().length).toBe(0);
        expect(getListItems().length).toBe(2);
        expect(fixture.componentInstance.selectedProjects()).toEqual([]);
      });
    });
  });

  describe('save button', () => {
    it('should be disabled if no project is selected', async () => {
      await render();

      expect(getSaveButton().nativeElement.disabled).toBe(true);
    });

    it('should be enabled if a project is selected', async () => {
      await render();

      getListItems()[0].nativeElement.click();

      await fixture.whenStable();

      expect(getSaveButton().nativeElement.disabled).toBe(false);
    });

    it('should close the dialog with the selected projects if clicked', async () => {
      await render();

      getListItems()[0].nativeElement.click();
      await fixture.whenStable();

      getListItems()[0].nativeElement.click();
      await fixture.whenStable();

      getSaveButton().nativeElement.click();

      validateFunctionCall(mockDialogRef.functions.close, {
        sourceProjectIds: [
          sourceProject1.projectId,
          sourceProject2.projectId,
        ],
        targetProjectId: targetProject.projectId,
      });
    });
  });

  describe('cancel button', () => {
    it('should be rendered', async () => {
      await render();

      expect(selector.getComponent(MatDialogClose, MatDialogActions)).toBeTruthy();
    });
  });
});
