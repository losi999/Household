import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectSelectDialog, ProjectSelectDialogData } from './project-select-dialog';
import { ClearableInput, createStubComponent, elementSelectorFactory, IElementSelector, MockSignalStore, provideMockSignalStore } from '@household/shared-ui';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { createMockService, MockService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { ProjectStore } from '@household/state/project/project-store';
import { MatListItem, MatActionList } from '@angular/material/list';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { Responses } from '@household/shared/types/responses';
import { Searchable } from '@household/shared/types/common';
import { toSearchable } from '@household/shared/common/utils';

describe('ProjectSelectDialog', () => {
  const ClearableInputStub = createStubComponent(ClearableInput);

  let fixture: ComponentFixture<ProjectSelectDialog>;
  let selector: IElementSelector;
  let mockDialogRef: MockService<MatDialogRef<ProjectSelectDialog>>;
  let mockProjectStore: MockSignalStore<typeof ProjectStore>;

  const project1 = toSearchable(testDataFactory.project.response({
    name: 'Építkezés',
  }), ['name']);
  const project2 = toSearchable(testDataFactory.project.response({
    name: 'Karbantartás',
  }), ['name']);

  const getSearchInput = () => {
    return selector.getComponent(ClearableInputStub, MatDialogContent);
  };

  const getListItems = () => {
    return selector.listComponents<MatListItem, HTMLButtonElement>(MatListItem, MatActionList);
  };

  const render = async (params?: {
    dialogData?: ProjectSelectDialogData;
    projectList?: Searchable<Responses.Project>[];
  }) => {
    TestBed.resetTestingModule();

    mockDialogRef = createMockService('close');
    
    await TestBed.configureTestingModule({
      imports: [ProjectSelectDialog],
      providers: [
        provideMockSignalStore(ProjectStore, 'projectList'),
        {
          provide: MAT_DIALOG_DATA,
          useValue: params?.dialogData,
        },
        {
          provide: MatDialogRef,
          useValue: mockDialogRef.service,
        },
      ],
    })
      .overrideComponent(ProjectSelectDialog, {
        remove: {
          imports: [ClearableInput],
        },
        add: {
          imports: [ClearableInputStub],
        },
      })
      .compileComponents();

    mockProjectStore = TestBed.inject<MockSignalStore<typeof ProjectStore>>(ProjectStore);
    mockProjectStore.projectList.set(params?.projectList ?? [
      project1,
      project2,
    ]);

    fixture = TestBed.createComponent(ProjectSelectDialog);
      
    selector = elementSelectorFactory(fixture.debugElement);
      
    await fixture.whenStable();
  };

  describe('dialog title', () => {
    it('should be rendered', async () => {
      await render();

      expect(selector.getComponent(MatDialogTitle).nativeElement.textContent).toContain('Projekt');
    });
  });

  describe('search input', () => {
    it('should be rendered', async () => {
      await render();

      expect(getSearchInput()).toBeTruthy();
    });
  });

  describe('selectable project list', () => {
    it('should display the projects from the store', async () => {
      await render();

      const listItems = getListItems();

      expect(listItems.length).toBe(2);
      expect(listItems[0].nativeElement.textContent.trim()).toBe(project1.name);
      expect(listItems[1].nativeElement.textContent.trim()).toBe(project2.name);
    });

    it('should display the projects from injected data', async () => {
      await render({
        dialogData: [project2],
        projectList: [
          project1,
          project2,
        ],
      });

      const listItems = getListItems();

      expect(listItems.length).toBe(1);
      expect(listItems[0].nativeElement.textContent.trim()).toBe(project2.name);
    });

    it('should be filtered based on search input value', async () => {
      await render(); 
 
      getSearchInput().componentInstance.value.set('építk');

      await fixture.whenStable();

      const listItems = getListItems();
  
      expect(listItems.length).toBe(1);
      expect(listItems[0].nativeElement.textContent.trim()).toBe(project1.name);
    });
  
    describe('on click', () => {
      it('should close the dialog with the selected project', async () => {
        await render();
  
        getListItems()[0].nativeElement.click();
  
        await fixture.whenStable();

        validateFunctionCall(mockDialogRef.functions.close, project1);
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
