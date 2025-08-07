import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Customer } from '@household/shared/types/types';
import { customerApiActions } from '@household/web/state/customer/customer.actions';
import { Store } from '@ngrx/store';

export type CustomerFormData = Customer.Response;

@Component({
  selector: 'household-customer-form',
  standalone: false,  
  templateUrl: './customer-form.component.html',
  styleUrl: './customer-form.component.scss',
})
export class CustomerFormComponent implements OnInit {
  form: FormGroup<{
    name: FormControl<string>;
    description: FormControl<string>;
  }>;
  constructor(private dialogRef: MatDialogRef<CustomerFormComponent, void>,
    private store: Store,
    @Inject(MAT_DIALOG_DATA) public customer: CustomerFormData) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      name: new FormControl(this.customer?.name, [Validators.required]),
      description: new FormControl(this.customer?.description),
    });
  }

  save() {
    if (this.form.valid) {
      const request: Customer.Request = {
        name: this.form.value.name,
        description: this.form.value.description?.trim() ?? undefined,
      };
      if (this.customer) {
        this.store.dispatch(customerApiActions.updateCustomerInitiated({
          customerId: this.customer.customerId,
          ...request,
        }));
      } else {
        this.store.dispatch(customerApiActions.createCustomerInitiated(request));
      }

      this.dialogRef.close();
    }
  }

}
