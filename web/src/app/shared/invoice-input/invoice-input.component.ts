import { Component, forwardRef, OnDestroy, OnInit } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { Transaction } from '@household/shared/types/types';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-invoice-input',
  templateUrl: './invoice-input.component.html',
  styleUrls: ['./invoice-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => InvoiceInputComponent),
    },
  ],
})
export class InvoiceInputComponent implements OnInit, OnDestroy, ControlValueAccessor {
  form: FormGroup;
  changed: (value: Transaction.Invoice<string>['invoice']) => void;
  touched: () => void;
  isDisabled: boolean;
  subs: Subscription;
  constructor() { }

  ngOnInit(): void {
    this.form = new FormGroup({
      invoiceNumber: new FormControl(null),
      billingStartDate: new FormControl(null, [Validators.required]),
      billingEndDate: new FormControl(null, [Validators.required]),
    });

    this.subs = this.form.valueChanges.subscribe((value: Transaction.Invoice<Date>['invoice']) => {
      if (this.form.invalid) {
        this.changed?.(null);
      } else {
        this.changed?.({
          invoiceNumber: value.invoiceNumber,
          billingStartDate: new Date(value.billingStartDate.getTime() - value.billingStartDate.getTimezoneOffset() * 60000).toISOString()
            .split('T')[0],
          billingEndDate: new Date(value.billingEndDate.getTime() - value.billingEndDate.getTimezoneOffset() * 60000).toISOString()
            .split('T')[0],
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
  writeValue(obj: Transaction.Invoice<Date>['invoice']): void {
    if (obj) {
      const startDate = new Date(obj.billingStartDate);
      const endDate = new Date(obj.billingEndDate);
      this.form.setValue({
        invoiceNumber: obj.invoiceNumber,
        billingStartDate: obj.billingStartDate ? new Date(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate()) : new Date(),
        billingEndDate: obj.billingEndDate ? new Date(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate()) : new Date(),
      });
    }
  }

  registerOnChange(fn: any): void {
    this.changed = fn;
  }

  registerOnTouched(fn: any): void {
    this.touched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }
}
