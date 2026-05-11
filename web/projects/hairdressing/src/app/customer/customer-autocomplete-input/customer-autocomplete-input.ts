import { Component, effect, inject, input, model, signal } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Store } from '@ngrx/store';
import { Customer } from '@household/shared/types/types';
import { selectCustomerList } from '@hairdressing/state/customer/customer-selector';
import { FormValueControl, ValidationError } from '@angular/forms/signals';
import { FormsModule } from '@angular/forms';
import { customerActions } from '@hairdressing/state/customer/customer-actions';
import { SignalErrorStateMatcher } from '@household/shared-ui';

@Component({
  selector: 'hairdressing-customer-autocomplete-input',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatAutocompleteModule,
    FormsModule,
  ],
  templateUrl: './customer-autocomplete-input.html',
  styleUrl: './customer-autocomplete-input.scss',
})
export class CustomerAutocompleteInput implements FormValueControl<Customer.Response> {
  value = model<Customer.Response>();

  touched = model<boolean>(false);

  required = input(false);
  errors = input<readonly ValidationError.WithOptionalFieldTree[]>([]);

  label = input.required<string>();
  exclude = input<Customer.Id[]>([]);
    
  matcher = new SignalErrorStateMatcher(this.touched);

  private store = inject(Store);

  private customers = this.store.selectSignal(selectCustomerList);

  filterValue = signal<string>('');

  filteredCustomers = signal<Customer.Response[]>([]);

  constructor() {
    effect(() => {
      this.matcher.showError.set(this.errors().length > 0);
    });

    effect(() => {
      this.filterValue.set(this.value()?.name ?? '');
    });
    
    effect(() => {
      const filteredCustomers = this.customers()?.filter((c) => {
        if (c.isArchived) {
          return false;
        }
        
        if (this.exclude()?.includes(c.customerId)) {
          return false;
        }
        const terms = this.filterValue().toLowerCase()
          .split(' ');
        
        if (terms.every(t => c.searchTerms?.some(s => s.includes(t)))) {
          return true;
        }
        
        return false;
        
      }) ?? [];
      this.filteredCustomers.set(filteredCustomers);
    
    });
  }

  clearValue(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.value.set(null);
  }

  optionSelected(input: HTMLInputElement) {
    setTimeout(() => input.blur());
  }

  onBlur() {
    if (this.value()?.name !== this.filterValue()) {
      this.value.set(null);
    }
  }

  create(event: MouseEvent) {
    this.store.dispatch(customerActions.createCustomer());
    event.stopPropagation();
  }
}
