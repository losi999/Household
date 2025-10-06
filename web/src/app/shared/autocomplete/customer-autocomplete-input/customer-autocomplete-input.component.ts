import { CommonModule } from '@angular/common';
import { Component, Injector, Input, OnInit, Self } from '@angular/core';
import { ControlValueAccessor, FormControl, FormControlDirective, FormControlName, FormGroupDirective, NgControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Customer } from '@household/shared/types/types';
import { AutocompleteFilterPipe } from '@household/web/app/shared/autocomplete/autocomplete-filter.pipe';
import { selectFilteredCustomers } from '@household/web/app/hairdressing/customer/state/customer.selector';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { customerActions } from '@household/web/app/hairdressing/customer/state/customer.actions';

@Component({
  selector: 'household-customer-autocomplete-input',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatAutocompleteModule,
    AutocompleteFilterPipe,
  ],
  templateUrl: './customer-autocomplete-input.component.html',
  styleUrl: './customer-autocomplete-input.component.scss',
})
export class CustomerAutocompleteInputComponent implements OnInit, ControlValueAccessor {
  @Input({
    required: true,
  }) label: string;
  @Input()exclude: Customer.Id[];
  selected: FormControl<Customer.Response>;

  changed: (value: Customer.Response) => void;
  touched: () => void;
  isDisabled: boolean;

  customers: Observable<Customer.Response[]>;

  constructor(private injector: Injector, private store: Store, @Self() public ngControl: NgControl) {
    ngControl.valueAccessor = this;
  }
  
  optionSelected(input: HTMLInputElement) {
    setTimeout(() => input.blur());
  }

  ngOnInit(): void {
    this.customers = this.store.select(selectFilteredCustomers(...this.exclude ?? []));

    if (this.ngControl instanceof FormControlName) {
      this.selected = this.injector.get(FormGroupDirective).getControl(this.ngControl);
    } else if (this.ngControl instanceof FormControlDirective) {
      this.selected = this.ngControl.form;
    }
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
    this.selected.markAsTouched();
    event.stopPropagation();
  }

  create(event: MouseEvent) {
    this.store.dispatch(customerActions.createCustomer());
    event.stopPropagation();
  }
}
