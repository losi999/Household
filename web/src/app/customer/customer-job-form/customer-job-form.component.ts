import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
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
  @Output() done = new EventEmitter();
  @Input() job: Customer.Job;
  @Input({
    required: true,
  }) customerId: Customer.Id;

  form: FormGroup<{
    name: FormControl<string>;
    description: FormControl<string>;
    price: FormControl<number>;
  }>;
  duration: number;

  constructor(private store: Store) {
  }
  
  ngOnInit(): void {
    this.duration = this.job?.duration ?? this.timeIncrement;
    this.form = new FormGroup({
      name: new FormControl(this.job?.name, [Validators.required]),
      description: new FormControl(this.job?.description),
      price: new FormControl(this.job?.price, [Validators.required]),
    });
  }

  get timeIncrement() {
    return 15;
  }

  onSetDuration(minutes: number) {
    this.duration += minutes;
  }

  onCancel() {
    this.done.emit();
  }

  onSave() {
    if (this.form.valid) {
      const request: Customer.Job = {
        name: this.form.value.name,
        description: this.form.value.description?.trim() ?? undefined,
        duration: this.duration,
        price: this.form.value.price,
      };

      if (this.job) {
        this.store.dispatch(customerApiActions.updateCustomerJobInitiated({
          customerId: this.customerId,
          jobName: this.job.name,
          ...request,
        }));
      } else {
        this.store.dispatch(customerApiActions.createCustomerJobInitiated({
          customerId: this.customerId,
          ...request,
        }));
      }
      this.done.emit();
    }
  }
}
