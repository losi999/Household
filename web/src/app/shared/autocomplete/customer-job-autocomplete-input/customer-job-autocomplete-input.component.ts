import { CommonModule } from '@angular/common';
import { Component, forwardRef, OnInit } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { Customer } from '@household/shared/types/types';
import { TimeSlotToTimePipe } from '@household/web/app/shared/time-slot-to-time.pipe';
import { selectCustomers } from '@household/web/app/hairdressing/customer/state/customer.selector';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { v4 } from 'uuid';
import { dialogActions } from '@household/web/state/dialog/dialog.actions';
import { CustomerAutocompleteInputComponent } from '@household/web/app/shared/autocomplete/customer-autocomplete-input/customer-autocomplete-input.component';

@Component({
  selector: 'household-customer-job-autocomplete-input',
  imports: [
    CustomerAutocompleteInputComponent,
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    TimeSlotToTimePipe,
  ],
  templateUrl: './customer-job-autocomplete-input.component.html',
  styleUrl: './customer-job-autocomplete-input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => CustomerJobAutocompleteInputComponent),
    },
  ],
})
export class CustomerJobAutocompleteInputComponent implements OnInit, ControlValueAccessor {
  selected: FormGroup<{
    customer: FormControl<Customer.Response>;
    job: FormControl<Customer.Job.Response | string>;
  }>;

  changed: (value: {
    customer: Customer.Response;
    job: Customer.Job.Response;
  }) => void;
  touched: () => void;
  isDisabled: boolean;

  customers: Observable<Customer.Response[]>;

  CUSTOM_JOB: string;

  constructor(private store: Store) { }
  
  optionSelected(input: HTMLInputElement) {
    setTimeout(() => input.blur());
  }

  ngOnInit(): void {
    this.CUSTOM_JOB = v4();

    this.selected = new FormGroup({
      customer: new FormControl(null, [Validators.required]),
      job: new FormControl(null, [Validators.required]),
    });

    this.selected.valueChanges.subscribe(({ customer, job }) => {
      this.changed?.(this.selected.valid ? {
        customer,
        job: typeof job !== 'string' ? job : undefined,
      } : null);
    });

    this.customers = this.store.select(selectCustomers);
  }

  writeValue(value: {
    customer: Customer.Response;
    job: Customer.Job.Response;
  }): void {
    if (value) {
      this.selected.setValue({
        customer: value.customer,
        job: value.job ?? this.CUSTOM_JOB,
      }, {
        emitEvent: false,
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

  displayName = (item: Customer.Response) => {
    return item?.name;
  };

  clearValue(event: MouseEvent) {
    this.selected.reset();
    this.selected.markAllAsTouched();
    event.stopPropagation();
  }

  create(event: MouseEvent) {
    this.store.dispatch(dialogActions.createCustomer());
    event.stopPropagation();
  }
}
