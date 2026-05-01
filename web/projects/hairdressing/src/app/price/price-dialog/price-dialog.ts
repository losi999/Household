import { Component, inject, signal } from '@angular/core';
import { form, required, FormField } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ClearableInput } from '@household/shared-ui';
import { Price } from '@household/shared/types/types';
import { MatSelectModule } from '@angular/material/select';
import { priceUnitsOfMeasurement } from '@household/shared/constants';
import { exclusiveMin } from '@household/shared-ui';

export type PriceDialogData = Price.Response;
export type PriceDialogResult = Price.Request;

@Component({
  selector: 'hairdressing-price-dialog',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    ClearableInput,
    FormField,
  ],
  templateUrl: './price-dialog.html',
  styleUrls: ['./price-dialog.scss'],
})
export class PriceDialog {
  private dialogRef = inject(MatDialogRef<PriceDialog, PriceDialog>);
  public price = inject<PriceDialogData>(MAT_DIALOG_DATA);

  priceModel = signal<Price.Request>({
    name: this.price?.name || '',
    amount: this.price?.amount || 0,
    unitOfMeasurement: this.price?.unitOfMeasurement || 'db',
  });
  
  priceForm = form(this.priceModel, (schemaPath) => {
    required(schemaPath.name, {
      message: 'Kötelező',
    });
    required(schemaPath.amount, {
      message: 'Kötelező',
    });
    exclusiveMin(schemaPath.amount, 0, {
      message: 'Az összegnek nagyobbnak kell lennie, mint 0',
    });
  });

  get unitsOfMeasurement() { return priceUnitsOfMeasurement; }

  onSave() {
    Object.values(this.priceForm).forEach(field => {
      field().markAsTouched();
    });

    if (this.priceForm().valid()) {
      this.dialogRef.close({
        name: this.priceForm.name().value(),
        amount: this.priceForm.amount().value(),
        unitOfMeasurement: this.priceForm.unitOfMeasurement().value(),
      });
    }

  }
}

