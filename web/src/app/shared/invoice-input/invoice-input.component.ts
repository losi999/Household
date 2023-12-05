import { CommonModule } from '@angular/common';
import { Component, forwardRef, OnDestroy, OnInit } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { Transaction } from '@household/shared/types/types';
import { Subject, takeUntil } from 'rxjs';
import { ClearableInputComponent } from 'src/app/shared/clearable-input/clearable-input.component';

@Component({
  selector: 'household-invoice-input',
  templateUrl: './invoice-input.component.html',
  styleUrls: ['./invoice-input.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatDatepickerModule,
    ClearableInputComponent,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => InvoiceInputComponent),
    },
  ],
})
export class InvoiceInputComponent implements OnInit, OnDestroy, ControlValueAccessor {
  form: FormGroup<{
    invoiceNumber: FormControl<string>;
    billingStartDate: FormControl<Date>;
    billingEndDate: FormControl<Date>;
  }>;
  changed: (value: Transaction.Invoice<string>['invoice']) => void;
  touched: () => void;
  isDisabled: boolean;
  private destroyed = new Subject();
  constructor() { }

  ngOnInit(): void {
    this.form = new FormGroup({
      invoiceNumber: new FormControl(null),
      billingStartDate: new FormControl(null, [Validators.required]),
      billingEndDate: new FormControl(null, [Validators.required]),
    });

    this.form.valueChanges.pipe(takeUntil(this.destroyed)).subscribe((value: Transaction.Invoice<Date>['invoice']) => {
      if (this.form.invalid) {
        this.changed?.(undefined);
      } else {
        this.changed?.({
          invoiceNumber: value.invoiceNumber ?? undefined,
          billingStartDate: new Date(value.billingStartDate.getTime() - value.billingStartDate.getTimezoneOffset() * 60000).toISOString()
            .split('T')[0],
          billingEndDate: new Date(value.billingEndDate.getTime() - value.billingEndDate.getTimezoneOffset() * 60000).toISOString()
            .split('T')[0],
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyed.next(undefined);
    this.destroyed.complete();
  }
  writeValue(obj: Transaction.Invoice<Date>['invoice']): void {
    if (obj) {
      const startDate = new Date(obj.billingStartDate);
      const endDate = new Date(obj.billingEndDate);
      this.form.patchValue({
        invoiceNumber: obj.invoiceNumber ?? null,
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
