import { Component, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { isListedPrice } from '@household/shared/common/type-guards';
import { PaymentType } from '@household/shared/enums';
import { Calendar } from '@household/shared/types/types';
import { JobPriceCalculatorValue } from '@household/web/app/shared/job-price-calculator/job-price-calculator.component';

export type CalendarEntryPayingDialogData = Calendar.Entry.WorkEntryResponse;
export type CalendarEntryPayingDialogResult = PaymentType;

@Component({
  standalone: false,  
  templateUrl: './calendar-entry-paying-dialog.component.html',
  styleUrl: './calendar-entry-paying-dialog.component.scss',
})
export class CalendarEntryPayingDialogComponent implements OnInit {
  prices: FormControl<JobPriceCalculatorValue[]>;

  constructor(private dialogRef: MatDialogRef<CalendarEntryPayingDialogComponent, CalendarEntryPayingDialogResult>,
    @Inject(MAT_DIALOG_DATA) public entry: CalendarEntryPayingDialogData) {}
  
  ngOnInit(): void {
    this.prices = new FormControl<JobPriceCalculatorValue[]>([]);

    if (this.entry.prices.length > 0) {
      this.prices.setValue(this.entry.prices.map((p) => {
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

  onCashPayment() {
    this.dialogRef.close(PaymentType.Cash);
  }
  
  onBankPayment() {
    this.dialogRef.close(PaymentType.Transfer);
  }
}
