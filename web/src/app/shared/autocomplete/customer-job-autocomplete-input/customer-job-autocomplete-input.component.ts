import { CommonModule } from '@angular/common';
import { Component, forwardRef, OnInit } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Customer } from '@household/shared/types/types';
import { TimeSlotToTimePipe } from '@household/web/app/shared/time-slot-to-time.pipe';
import { AutocompleteFilterPipe } from '@household/web/app/shared/autocomplete/autocomplete-filter.pipe';
import { selectCustomerList } from '@household/web/state/customer/customer.selector';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { v4 } from 'uuid';

@Component({
  selector: 'household-customer-job-autocomplete-input',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    MatAutocompleteModule,
    AutocompleteFilterPipe,
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
    jobName: FormControl<string>;
  }>;

  changed: (value: Customer.CustomerId & {
    job?: Customer.Job.Response;
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
      jobName: new FormControl(null, [Validators.required]),
    });

    this.selected.valueChanges.subscribe(({ customer, jobName }) => {
      this.changed?.(this.selected.valid ? {
        job: customer.jobs.find(j => j.name === jobName),
        customerId: customer.customerId,
      } : null);
    });

    this.customers = this.store.select(selectCustomerList);
  }

  writeValue(): void { }

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
}
