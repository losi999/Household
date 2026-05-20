import { Component, computed, effect, inject, input, model, signal } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Customer } from '@household/shared/types/types';
import { FormValueControl, ValidationError } from '@angular/forms/signals';
import { FormsModule } from '@angular/forms';
import { SignalErrorStateMatcher } from '@household/shared-ui';
import { CustomerStore } from '@hairdressing/state/customer/customer-store';
import { injectDispatch } from '@ngrx/signals/events';
import { customerEvents } from '@hairdressing/state/customer/customer-events';

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
  readonly customerStore = inject(CustomerStore);
  private customerEvents = injectDispatch(customerEvents);
  
  value = model<Customer.Response>();

  touched = model<boolean>(false);

  required = input(false);
  errors = input<readonly ValidationError.WithOptionalFieldTree[]>([]);

  label = input.required<string>();
  exclude = input<Customer.Id[]>([]);
    
  matcher = new SignalErrorStateMatcher(this.touched);

  filterValue = signal<string>('');

  filteredCustomers = computed(() => {
    return this.customerStore.customerList()?.filter((c) => {
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
  });

  constructor() {
    effect(() => {
      this.matcher.showError.set(this.errors().length > 0);
    });

    effect(() => {
      this.filterValue.set(this.value()?.name ?? '');
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
    if (!this.value()) {
      return;
    }
    if (this.value().name !== this.filterValue()) {
      this.value.set(null);
    }
  }

  create(event: MouseEvent) {
    this.customerEvents.createCustomer();
    event.stopPropagation();
  }
}
