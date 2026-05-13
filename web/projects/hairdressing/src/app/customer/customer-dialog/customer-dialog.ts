import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ClearableInput } from '@household/shared-ui';
import { Customer } from '@household/shared/types/types';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { form, FormField, required } from '@angular/forms/signals';
import { toUndefined } from '@household/shared/common/utils';

export type CustomerDialogData = Customer.Response;
export type CustomerDialogResult = Customer.Request;

@Component({
  imports: [
    MatCheckboxModule,
    ClearableInput,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    FormField,
  ],
  templateUrl: './customer-dialog.html',
  styleUrl: './customer-dialog.scss',
})
export class CustomerDialog {
  private dialogRef = inject<MatDialogRef<CustomerDialog, CustomerDialogResult>>(MatDialogRef);
  public customer = inject<CustomerDialogData>(MAT_DIALOG_DATA);

  customerModel = signal<Customer.Request>({
    name: this.customer?.name || '',
    description: this.customer?.description || '',
    isGroup: this.customer?.isGroup || false,
    rating: this.customer?.rating || 3,
  });

  customerForm = form(this.customerModel, (schemaPath) => {
    required(schemaPath.name, {
      message: 'Kötelező',
    });
  });

  onSetRating(rating: number) {
    this.customerForm.rating().value.set(rating);
  }

  onSave() {
    Object.values(this.customerForm).forEach(field => {
      field().markAsTouched();
    });

    if (this.customerForm().valid()) {
      this.dialogRef.close({
        name: this.customerForm.name().value(),
        description: toUndefined(this.customerForm.description().value()
          .trim()),
        isGroup: this.customerForm.isGroup().value(),
        rating: this.customerForm.rating().value(),
      });
    }
  }

}
