import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PaymentType } from '@household/shared/enums';
import { Calendar } from '@household/shared/types/types';
import { calendarApiActions } from '@household/web/state/calendar/calendar.actions';
import { dialogActions } from '@household/web/state/dialog/dialog.actions';
import { Store } from '@ngrx/store';

export type CalendarCashPaymentDialogData = Calendar.Entry.WorkEntryResponse;

@Component({
  standalone: false,
  templateUrl: './calendar-cash-payment-dialog.component.html',
  styleUrl: './calendar-cash-payment-dialog.component.scss',
})
export class CalendarCashPaymentDialogComponent implements OnInit {
  form: FormGroup<{
    amount: FormControl<number>
  }>;

  constructor(private dialogRef: MatDialogRef<CalendarCashPaymentDialogComponent, void>,
    private store: Store, 
    @Inject(MAT_DIALOG_DATA) public entry: CalendarCashPaymentDialogData) {}
  
  ngOnInit(): void {
    this.form = new FormGroup({
      amount: new FormControl(null, [Validators.required]),
    });
  }
  onSave() {
    if (this.form.valid) {
      this.store.dispatch(dialogActions.closeAll());
      this.store.dispatch(calendarApiActions.payCalendarWorkEntryInitiated({
        calendarEntryId: this.entry.calendarEntryId,
        paymentType: PaymentType.Cash,
        amount: this.form.value.amount,
        day: this.entry.day,
      }));

      this.dialogRef.close();
    }
  }
}
