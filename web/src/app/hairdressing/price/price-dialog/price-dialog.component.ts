import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { priceUnitsOfMeasurement } from '@household/shared/constants';
import { Price } from '@household/shared/types/types';
import { priceApiActions } from '@household/web/state/price/price.actions';
import { Store } from '@ngrx/store';

export type PriceDialogData = Price.Response;

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

  constructor(private dialogRef: MatDialogRef<PriceDialogComponent, void>,
    private store: Store,
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
      const request: Price.Request = {
        name: this.form.value.name,
        amount: this.form.value.amount ?? undefined,
        unitOfMeasurement: this.form.value.unitOfMeasurement,
      };
      if (this.price) {
        this.store.dispatch(priceApiActions.updatePriceInitiated({
          priceId: this.price.priceId,
          ...request,
        }));
      } else {
        this.store.dispatch(priceApiActions.createPriceInitiated(request));
      }

      this.dialogRef.close();
    }
  }

}
