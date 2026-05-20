import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmationDialog } from './confirmation-dialog';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { elementSelectorFactory, IElementSelector } from '@household/shared-ui';

describe('ConfirmationDialog', () => {
  let fixture: ComponentFixture<ConfirmationDialog>;
  let selector: IElementSelector;
  const title = 'dialog title';
  const content = 'dialog content';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmationDialog],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            title, 
            content,
          },
        },
      ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(ConfirmationDialog);

    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  });

  it('should create', () => {
    expect(selector.getComponent(MatDialogTitle).nativeElement.textContent.trim()).toBe(title);
    expect(selector.getComponent(MatDialogContent).nativeElement.textContent.trim()).toBe(content);
    const dialogActionsElement = selector.getComponent(MatDialogActions);
    const yesButton = dialogActionsElement.children[0];
    const noButton = dialogActionsElement.children[1];
    expect(yesButton.nativeElement.textContent).toBe('Igen');
    expect(noButton.nativeElement.textContent).toBe('Nem');
  });
});
