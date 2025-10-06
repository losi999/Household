import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PaymentType } from '@household/shared/enums';
import { Calendar } from '@household/shared/types/types';

export type CalendarCashPaymentDialogData = Calendar.Entry.WorkEntryResponse;
export type CalendarCashPaymentDialogResult = Calendar.Entry.PaymentRequest;

@Component({
  standalone: false,
  templateUrl: './calendar-cash-payment-dialog.component.html',
  styleUrl: './calendar-cash-payment-dialog.component.scss',
})
export class CalendarCashPaymentDialogComponent implements OnInit {
  form: FormGroup<{
    amount: FormControl<number>
  }>;

  constructor(private dialogRef: MatDialogRef<CalendarCashPaymentDialogComponent, CalendarCashPaymentDialogResult>,
    @Inject(MAT_DIALOG_DATA) public entry: CalendarCashPaymentDialogData) {}
  
  ngOnInit(): void {
    this.form = new FormGroup({
      amount: new FormControl(null, [Validators.required]),
    });
  }
  onSave() {
    if (this.form.valid) {
      this.dialogRef.close({
        paymentType: PaymentType.Cash,
        amount: this.form.value.amount,
      });
    }
  }
}
