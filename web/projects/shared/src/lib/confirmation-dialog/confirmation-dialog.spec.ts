import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmationDialog } from './confirmation-dialog';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { elementSelectorFactory, IElementSelector } from '@household/shared-ui';

describe('ConfirmationDialog', () => {
  let fixture: ComponentFixture<ConfirmationDialog>;
  let selector: IElementSelector;

  const dialogData = {
    title: 'dialog title',
    content: 'dialog content',
  };

  const render = async (data = dialogData) => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [ConfirmationDialog],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: data,
        },
      ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(ConfirmationDialog);

    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  };

  it('should create', async () => {
    await render();

    expect(selector.getComponent(MatDialogTitle).nativeElement.textContent.trim()).toBe(dialogData.title);
    expect(selector.getComponent(MatDialogContent).nativeElement.textContent.trim()).toBe(dialogData.content);
    const dialogActionsElement = selector.getComponent(MatDialogActions);
    const yesButton = dialogActionsElement.children[0];
    const noButton = dialogActionsElement.children[1];
    expect(yesButton.nativeElement.textContent).toBe('Igen');
    expect(noButton.nativeElement.textContent).toBe('Nem');
  });
});
