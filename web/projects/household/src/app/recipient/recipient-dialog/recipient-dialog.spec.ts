import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecipientDialog, RecipientDialogData } from './recipient-dialog';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { ClearableInput, createStubComponent, elementSelectorFactory, IElementSelector } from '@household/shared-ui';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { createMockService, MockService, validateFunctionCall } from '@household/shared/common/unit-testing';

describe('RecipientDialog', () => {
  const ClearableInputStub = createStubComponent(ClearableInput);

  let fixture: ComponentFixture<RecipientDialog>;
  let selector: IElementSelector;
  let mockDialogRef: MockService<MatDialogRef<RecipientDialog>>;

  const recipient = testDataFactory.recipient.response();

  const getNameInput = () => {
    return selector.getComponentByTestId<ClearableInput>('name', MatDialogContent);
  };

  const setValue = async (input: ClearableInput, value: string) => {
    input.value.set(value);

    await fixture.whenStable();
  };

  const getSaveButton = () => {
    return selector.getElementByTestId<HTMLButtonElement>('save-button', MatDialogActions);
  };

  const render = async (dialogData: RecipientDialogData = undefined) => {
    TestBed.resetTestingModule();

    mockDialogRef = createMockService('close');

    await TestBed.configureTestingModule({
      imports: [RecipientDialog],
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
      .overrideComponent(RecipientDialog, {
        remove: {
          imports: [ClearableInput],
        },
        add: {
          imports: [ClearableInputStub],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(RecipientDialog);

    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  };

  describe('dialog title', () => {
    it('should be the create title if no recipient is given', async () => {
      await render();

      expect(selector.getComponent(MatDialogTitle).nativeElement.textContent).toBe('Új partner');
    });

    it('should be the edit title if a recipient is given', async () => {
      await render(recipient);

      expect(selector.getComponent(MatDialogTitle).nativeElement.textContent).toBe('Partner szerkesztése');
    });
  });

  describe('name input', () => {
    it('should be empty if no recipient is given', async () => {
      await render();

      expect(getNameInput().componentInstance.label()).toBe('Név');
      expect(getNameInput().componentInstance.value()).toBe('');
    });

    it('should be filled with the name of the recipient', async () => {
      await render(recipient);

      expect(getNameInput().componentInstance.value()).toBe(recipient.name);
    });

    it('should be required', async () => {
      await render();

      expect(getNameInput().componentInstance.errors().map(error => error.message)).toEqual(['Kötelező']);
    });
  });

  describe('save button', () => {
    it('should be disabled if form is invalid', async () => {
      await render();

      expect(getSaveButton().nativeElement.disabled).toBe(true);
    });

    it('should not close the dialog if the name is empty', async () => {
      await render();

      getSaveButton().nativeElement.click();

      await fixture.whenStable();

      validateFunctionCall(mockDialogRef.functions.close);
    });

    it('should close the dialog with the entered values', async () => {
      await render();

      await setValue(getNameInput().componentInstance, 'recipient name');

      getSaveButton().nativeElement.click();

      validateFunctionCall(mockDialogRef.functions.close, {
        name: 'recipient name',
      });
    });

    it('should close the dialog with an undefined description if it is empty', async () => {
      await render();

      await setValue(getNameInput().componentInstance, 'recipient name');

      getSaveButton().nativeElement.click();

      validateFunctionCall(mockDialogRef.functions.close, {
        name: 'recipient name',
        description: undefined,
      });
    });

    it('should close the dialog with the values of the edited recipient', async () => {
      await render(recipient);

      getSaveButton().nativeElement.click();

      validateFunctionCall(mockDialogRef.functions.close, {
        name: recipient.name,
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
