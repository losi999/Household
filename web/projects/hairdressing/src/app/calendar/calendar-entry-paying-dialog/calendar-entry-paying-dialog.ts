import { DatePipe } from '@angular/common';
import { Component, inject, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { form, required, FormField } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TimeSlotToTimePipe } from '@hairdressing/app/pipes/time-slot-to-time-pipe';
import { JobPriceCalculator, JobPriceCalculatorValue } from '@hairdressing/app/shared/job-price-calculator/job-price-calculator';
import { IconText, AmountInput, exclusiveMin } from '@household/shared-ui';
import { CalendarEntryResolutionStatus } from '@household/shared/enums';
import { Calendar } from '@household/shared/types/types';

export type CalendarEntryPayingDialogData = Calendar.Entry.WorkEntryResponse;
export type CalendarEntryPayingDialogResult = Calendar.Entry.ResolutionRequest;

@Component({
  imports: [
    MatDialogModule,
    MatButtonModule,
    JobPriceCalculator,
    IconText,
    AmountInput,
    MatButtonToggleModule,
    DatePipe,
    TimeSlotToTimePipe,
    FormsModule,
    FormField,
  ],
  templateUrl: './calendar-entry-paying-dialog.html',
  styleUrl: './calendar-entry-paying-dialog.scss',
})
export class CalendarEntryPayingDialog {
  private dialogRef = inject<MatDialogRef<CalendarEntryPayingDialog, CalendarEntryPayingDialogResult>>(MatDialogRef);
  entry = inject<CalendarEntryPayingDialogData>(MAT_DIALOG_DATA);

  paymentType = model<string>();

  amountForm = form(signal<number>(0), (schemaPath) => {
    required(schemaPath, {
      message: 'Kötelező',
    });
    exclusiveMin(schemaPath, 0, {
      message: 'Az összegnek nagyobbnak kell lennie, mint 0',
    });
  });

  cost = model<JobPriceCalculatorValue>({
    additionalPrice: this.entry.additionalPrice,
    prices: this.entry.prices?.map((priceResponse) => {
      const { quantity, ...price } = priceResponse;
      return {
        price,
        quantity,
      };
    }) ?? [],
  });

  onSubmit() {
    if (this.paymentType() === 'cash') {
      this.amountForm().markAsTouched();
      if (this.amountForm().valid()) {
        this.dialogRef.close({
          status: CalendarEntryResolutionStatus.Paid,
          amount: this.amountForm().value(),
          delay: undefined,
        });
      }
    } else {
      this.dialogRef.close({
        status: CalendarEntryResolutionStatus.PendingTransfer,
        delay: undefined,
      });
    }
  }
}
