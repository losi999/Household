import { Component, inject, signal } from '@angular/core';
import { FormField, form, required } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ClearableInput } from '@household/shared-ui';
import { Requests } from '@household/shared/types/requests';
import { Responses } from '@household/shared/types/responses';

export type RecipientDialogData = Responses.Recipient;
export type RecipientDialogResult = Requests.Recipient;

@Component({
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    ClearableInput,
    FormField,
  ],
  styleUrl: './recipient-dialog.scss',
  templateUrl: './recipient-dialog.html',
})
export class RecipientDialog {
  private dialogRef = inject<MatDialogRef<RecipientDialog, RecipientDialogResult>>(MatDialogRef);
  public recipient = inject<RecipientDialogData>(MAT_DIALOG_DATA);

  recipientModel = signal<Requests.Recipient>({
    name: this.recipient?.name || '',
  });
  
  recipientForm = form(this.recipientModel, (schemaPath) => {
    required(schemaPath.name, {
      message: 'Kötelező',
    });
  });

  onSave() {
    Object.values(this.recipientForm).forEach(field => {
      field().markAsTouched();
    });

    if (this.recipientForm().valid()) {
      this.dialogRef.close({
        name: this.recipientForm.name().value(),
      });
    }
  }
}
