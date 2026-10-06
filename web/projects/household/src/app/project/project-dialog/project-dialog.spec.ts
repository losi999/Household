import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectDialog, ProjectDialogData } from './project-dialog';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { ClearableInput, createStubComponent, elementSelectorFactory, IElementSelector } from '@household/shared-ui';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { createMockService, MockService, validateFunctionCall } from '@household/shared/common/unit-testing';

describe('ProjectDialog', () => {
  const ClearableInputStub = createStubComponent(ClearableInput);

  let fixture: ComponentFixture<ProjectDialog>;
  let selector: IElementSelector;
  let mockDialogRef: MockService<MatDialogRef<ProjectDialog>>;

  const project = testDataFactory.project.response();

  const getNameInput = () => {
    return selector.getComponentByTestId<ClearableInput>('name', MatDialogContent);
  };

  const getDescriptionInput = () => {
    return selector.getComponentByTestId<ClearableInput>('description', MatDialogContent);
  };

  const setValue = async (input: ClearableInput, value: string) => {
    input.value.set(value);

    await fixture.whenStable();
  };

  const getSaveButton = () => {
    return selector.getElementByTestId<HTMLButtonElement>('save-button', MatDialogActions);
  };

  const render = async (dialogData: ProjectDialogData = undefined) => {
    TestBed.resetTestingModule();

    mockDialogRef = createMockService('close');

    await TestBed.configureTestingModule({
      imports: [ProjectDialog],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: dialogData,
        },
        {
          provide: MatDialogRef,
          useValue: mockDialogRef.service,
        },
      ],
    })
      .overrideComponent(ProjectDialog, {
        remove: {
          imports: [ClearableInput],
        },
        add: {
          imports: [ClearableInputStub],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ProjectDialog);

    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  };

  describe('dialog title', () => {
    it('should be the create title if no project is given', async () => {
      await render();

      expect(selector.getComponent(MatDialogTitle).nativeElement.textContent).toBe('Új projekt');
    });

    it('should be the edit title if a project is given', async () => {
      await render(project);

      expect(selector.getComponent(MatDialogTitle).nativeElement.textContent).toBe('Projekt szerkesztése');
    });
  });

  describe('name input', () => {
    it('should be empty if no project is given', async () => {
      await render();

      expect(getNameInput().componentInstance.label()).toBe('Név');
      expect(getNameInput().componentInstance.value()).toBe('');
    });

    it('should be filled with the name of the project', async () => {
      await render(project);

      expect(getNameInput().componentInstance.value()).toBe(project.name);
    });
  });

  describe('description input', () => {
    it('should be empty if no project is given', async () => {
      await render();

      expect(getDescriptionInput().componentInstance.label()).toBe('Leírás');
      expect(getDescriptionInput().componentInstance.value()).toBe('');
    });

    it('should be filled with the description of the project', async () => {
      await render(project);

      expect(getDescriptionInput().componentInstance.value()).toBe(project.description);
    });
  });

  describe('save button', () => {
    it('should not close the dialog and should display an error if the name is empty', async () => {
      await render();

      getSaveButton().nativeElement.click();

      await fixture.whenStable();

      validateFunctionCall(mockDialogRef.functions.close);
      expect(getNameInput().componentInstance.touched()).toBe(true);
      expect(getNameInput().componentInstance.errors().map(e => e.message)).toEqual(['Kötelező']);
    });

    it('should close the dialog with the entered values', async () => {
      await render();

      await setValue(getNameInput().componentInstance, 'project name');
      await setValue(getDescriptionInput().componentInstance, 'project description');

      getSaveButton().nativeElement.click();

      validateFunctionCall(mockDialogRef.functions.close, {
        name: 'project name',
        description: 'project description',
      });
    });

    it('should close the dialog with an undefined description if it is empty', async () => {
      await render();

      await setValue(getNameInput().componentInstance, 'project name');

      getSaveButton().nativeElement.click();

      validateFunctionCall(mockDialogRef.functions.close, {
        name: 'project name',
        description: undefined,
      });
    });

    it('should close the dialog with the values of the edited project', async () => {
      await render(project);

      getSaveButton().nativeElement.click();

      validateFunctionCall(mockDialogRef.functions.close, {
        name: project.name,
        description: project.description,
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
