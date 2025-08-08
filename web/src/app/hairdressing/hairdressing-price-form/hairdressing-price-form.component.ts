import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Price } from '@household/shared/types/types';
import { hairdressingApiActions } from '@household/web/state/hairdressing/hairdressing.actions';
import { Store } from '@ngrx/store';

export type HairdressingPriceFormData = Price.Response;

@Component({
  selector: 'household-hairdressing-price-form',
  standalone: false,  
  templateUrl: './hairdressing-price-form.component.html',
  styleUrl: './hairdressing-price-form.component.scss',
})
export class HairdressingPriceFormComponent implements OnInit {
  form: FormGroup<{
    name: FormControl<string>;
    amount: FormControl<number>;
  }>;
  constructor(private dialogRef: MatDialogRef<HairdressingPriceFormComponent, void>,
    private store: Store,
    @Inject(MAT_DIALOG_DATA) public price: HairdressingPriceFormData) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      name: new FormControl(this.price?.name, [Validators.required]),
      amount: new FormControl(this.price?.amount, [Validators.required]),
    });
  }

  save() {
    if (this.form.valid) {
      const request: Price.Request = {
        name: this.form.value.name,
        amount: this.form.value.amount ?? undefined,
      };
      if (this.price) {
        this.store.dispatch(hairdressingApiActions.updatePriceInitiated({
          priceId: this.price.priceId,
          ...request,
        }));
      } else {
        this.store.dispatch(hairdressingApiActions.createPriceInitiated(request));
      }

      this.dialogRef.close();
    }
  }

}
