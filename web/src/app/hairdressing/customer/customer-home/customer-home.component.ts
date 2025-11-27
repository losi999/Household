import { toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { filterSearchable } from '@household/shared/common/utils';
import { ChangeDetectionStrategy, Component, computed, model, OnInit, signal } from '@angular/core';
import { CustomerListComponent } from '@household/web/app/hairdressing/customer/customer-list/customer-list.component';
import { customerActions, customerApiActions } from '@household/web/app/hairdressing/customer/state/customer.actions';
import { selectCustomerList } from '@household/web/app/hairdressing/customer/state/customer.selector';
import { ClearableInputComponent } from '@household/web/app/controls/clearable-input/clearable-input.component';
import { ToolbarComponent } from '@household/web/app/shared/toolbar/toolbar.component';
import { Store } from '@ngrx/store';
import { email, Field, form, maxLength, min, minLength, pattern, required } from '@angular/forms/signals';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'household-customer-home',
  templateUrl: './customer-home.component.html',
  styleUrl: './customer-home.component.scss',
  imports: [
    ReactiveFormsModule,
    CustomerListComponent,
    MatFormFieldModule,
    MatInputModule,
    ClearableInputComponent,
    MatIconModule,
    ToolbarComponent,
    MatButtonModule,
    Field,
    JsonPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerHomeComponent implements OnInit {
  
  customers = toSignal(this.store.select(selectCustomerList));
  
  search = model<string>('something to search');
  searchForm = form(this.search);
  
  model = signal<{
    name: string;
    age: number;
    description: string;
  }>({
    name: 'dick pole',
    description: null,
    age: 15,
  });
  form = form(this.model, (schemaPath) => {
    required(schemaPath.name, {
      message: 'Kötelező',
    });
    minLength(schemaPath.name, 3, {
      message: 'Minimum 3 karakter szükséges',
    });
    email(schemaPath.name);
    required(schemaPath.age);
    min(schemaPath.age, 5);
    required(schemaPath.description);
  });

  filteredCustomers = computed(() => {
    if (!this.search()) {
      return this.customers();
    }

    return filterSearchable(this.customers(), this.search());
  });

  constructor(private store: Store) { }
  
  ngOnInit(): void {

    this.store.dispatch(customerApiActions.listCustomersInitiated());
  }

  onSubmit(event: SubmitEvent) {
    event.preventDefault();
    this.form().markAsTouched();

    console.log(this.form().value());

    console.log(this.form().errorSummary());
  }

  onCreate() {
    this.store.dispatch(customerActions.createCustomer());
  }
}
