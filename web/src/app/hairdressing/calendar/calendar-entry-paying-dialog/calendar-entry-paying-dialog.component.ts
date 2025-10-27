import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { isListedPrice } from '@household/shared/common/type-guards';
import { toUndefined } from '@household/shared/common/utils';
import { CalendarEntryResolutionStatus } from '@household/shared/enums';
import { Calendar } from '@household/shared/types/types';
import { JobPriceCalculatorValue } from '@household/web/app/shared/job-price-calculator/job-price-calculator.component';

export type CalendarEntryPayingDialogData = Calendar.Entry.WorkEntryResponse;
export type CalendarEntryPayingDialogResult = Calendar.Entry.ResolutionRequest;

@Component({
  standalone: false,  
  templateUrl: './calendar-entry-paying-dialog.component.html',
  styleUrl: './calendar-entry-paying-dialog.component.scss',
})
export class CalendarEntryPayingDialogComponent implements OnInit {
  form: FormGroup<{
    prices: FormControl<JobPriceCalculatorValue[]>;
    paymentType: FormControl<'cash' | 'transfer'>;
    delay: FormControl<number>;
    amount: FormControl<number>;
  }>;

  constructor(private dialogRef: MatDialogRef<CalendarEntryPayingDialogComponent, CalendarEntryPayingDialogResult>,
    @Inject(MAT_DIALOG_DATA) public entry: CalendarEntryPayingDialogData) {}
  
  ngOnInit(): void {
    this.form = new FormGroup({
      prices: new FormControl<JobPriceCalculatorValue[]>([]),
      delay: new FormControl(),
      paymentType: new FormControl(null, [Validators.required]),
      amount: new FormControl(null, [Validators.required]),
    });

    this.form.controls.paymentType.valueChanges.subscribe((value) => {
      if (value === 'cash') {
        this.form.controls.amount.setValidators([Validators.required]);
      } else {
        this.form.controls.amount.clearValidators();
      }

      this.form.controls.amount.updateValueAndValidity();
    });    
    if (this.entry.prices?.length > 0) {
      this.form.controls.prices.setValue(this.entry.prices.map((p) => {
        if (isListedPrice(p)) {
          const { quantity, ...price } = p;
          return {
            quantity,
            price,
          };
        }
      
        return p;
      }));
    }
  }

  onSubmit() {
    if (this.form.valid) {
      if (this.form.value.paymentType === 'cash') {
        this.dialogRef.close({
          status: CalendarEntryResolutionStatus.Paid,
          amount: this.form.value.amount,
          delay: toUndefined(this.form.value.delay),
        });
      } else {
        this.dialogRef.close({
          status: CalendarEntryResolutionStatus.PendingTransfer,
          delay: toUndefined(this.form.value.delay),
        });
      }

    }
  }
}
