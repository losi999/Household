import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Customer, Price } from '@household/shared/types/types';
import { customerApiActions } from '@household/web/state/customer/customer.actions';
import { selectPriceList } from '@household/web/state/hairdressing/hairdressing.selector';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

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
    duration: FormControl<number>;
    price: FormControl<number>;
  }>;
  prices: Observable<Price.Response[]>;
  selectedPrices: Price.Response[];

  constructor(private store: Store) {
  }
  
  ngOnInit(): void {
    this.prices = this.store.select(selectPriceList);
    this.selectedPrices = [];

    this.form = new FormGroup({
      name: new FormControl(this.job?.name, [Validators.required]),
      description: new FormControl(this.job?.description),
      duration: new FormControl(this.job?.duration ?? this.timeIncrement, [
        Validators.required,
        Validators.min(this.timeIncrement),
      ]),
      price: new FormControl(this.job?.price ?? 0, [
        Validators.required,
        Validators.min(1),
      ]),
    });
  }

  get timeIncrement() {
    return 15;
  }

  onSetDuration(minutes: number) {
    this.form.patchValue({
      duration: this.form.value.duration + minutes,
    }, {
      emitEvent: false,
    });
  }

  onCancel() {
    this.done.emit();
  }

  onSave() {
    console.log(this.form);
    if (this.form.valid) {
      const request: Customer.Job = {
        name: this.form.value.name,
        description: this.form.value.description?.trim() ?? undefined,
        duration: this.form.value.duration,
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

  onRemovePrice(price: Price.Response) {
    this.selectedPrices = this.selectedPrices.filter(p => p.priceId !== price.priceId);
    this.form.patchValue({
      price: this.form.value.price - price.amount,
    }, {
      emitEvent: false,
    });
  }

  onAddPrice(price: Price.Response) {
    this.selectedPrices.push(price);
    this.form.patchValue({
      price: this.form.value.price + price.amount,
    }, {
      emitEvent: false,
    });
  }
}
