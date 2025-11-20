import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { priceUnitsOfMeasurement } from '@household/shared/constants';
import { Price } from '@household/shared/types/types';
import { AmountInputComponent } from '@household/web/app/shared/amount-input/amount-input.component';
import { ClearableInputComponent } from '@household/web/app/shared/clearable-input/clearable-input.component';

export type PriceDialogData = Price.Response;
export type PriceDialogResult = Price.Request;

@Component({
  imports: [
    MatDialogModule,
    ReactiveFormsModule,
    ClearableInputComponent,
    AmountInputComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
  ],  
  templateUrl: './price-dialog.component.html',
  styleUrl: './price-dialog.component.scss',
})
export class PriceDialogComponent implements OnInit {
  form: FormGroup<{
    name: FormControl<string>;
    amount: FormControl<number>;
    unitOfMeasurement: FormControl<Price.Request['unitOfMeasurement']>,
  }>;

  get unitsOfMeasurement() { return priceUnitsOfMeasurement; }

  constructor(private dialogRef: MatDialogRef<PriceDialogComponent, PriceDialogResult>,
    @Inject(MAT_DIALOG_DATA) public price: PriceDialogData) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      name: new FormControl(this.price?.name, [Validators.required]),
      amount: new FormControl(this.price?.amount, [Validators.required]),
      unitOfMeasurement: new FormControl(this.price?.unitOfMeasurement ?? 'db'),
    });
  }

  onSave() {
    if (this.form.valid) {
      this.dialogRef.close({
        name: this.form.value.name,
        amount: this.form.value.amount ?? undefined,
        unitOfMeasurement: this.form.value.unitOfMeasurement,
      });
    }
  }
}
