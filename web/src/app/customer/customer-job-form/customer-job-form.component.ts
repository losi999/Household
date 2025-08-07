import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Customer } from '@household/shared/types/types';
import { customerApiActions } from '@household/web/state/customer/customer.actions';
import { Store } from '@ngrx/store';

export type CustomerJobFormData = Customer.CustomerId & {
  job?: Customer.Job
};

@Component({
  selector: 'household-customer-job-form',
  standalone: false,  
  templateUrl: './customer-job-form.component.html',
  styleUrl: './customer-job-form.component.scss',
})
export class CustomerJobFormComponent implements OnInit {
  form: FormGroup<{
    name: FormControl<string>;
    description: FormControl<string>;
    price: FormControl<number>;
  }>;
  duration: number;

  constructor(private dialogRef: MatDialogRef<CustomerJobFormComponent, void>,
    private store: Store,
    @Inject(MAT_DIALOG_DATA) public data: CustomerJobFormData) {
  }
  
  ngOnInit(): void {
    this.duration = this.data.job?.duration ?? 15;
    this.form = new FormGroup({
      name: new FormControl(this.data.job?.name, [Validators.required]),
      description: new FormControl(this.data.job?.description),
      price: new FormControl(this.data.job?.price, [Validators.required]),
    });
  }

  setDuration(minutes: number) {
    this.duration += minutes;
  }

  save() {
    if (this.form.valid) {
      const request: Customer.Job = {
        name: this.form.value.name,
        description: this.form.value.description?.trim() ?? undefined,
        duration: this.duration,
        price: this.form.value.price,
      };

      if (this.data.job) {
        this.store.dispatch(customerApiActions.updateCustomerJobInitiated({
          customerId: this.data.customerId,
          jobName: this.data.job.name,
          ...request,
        }));
      } else {
        this.store.dispatch(customerApiActions.createCustomerJobInitiated({
          customerId: this.data.customerId,
          ...request,
        }));
      }
  
      this.dialogRef.close();
    }
  }
}
