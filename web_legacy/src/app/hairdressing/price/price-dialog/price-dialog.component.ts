import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { priceUnitsOfMeasurement } from '@household/shared/constants';
import { Price } from '@household/shared/types/types';

export type PriceDialogData = Price.Response;
export type PriceDialogResult = Price.Request;

@Component({
  standalone: false,  
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
