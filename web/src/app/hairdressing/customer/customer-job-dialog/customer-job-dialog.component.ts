import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Customer, Price } from '@household/shared/types/types';
import { JobPriceCalculatorComponent, JobPriceCalculatorValue } from '@household/web/app/shared/job-price-calculator/job-price-calculator.component';
import { selectPriceList } from '@household/web/app/hairdressing/price/state/price.selector';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ClearableInputComponent } from '@household/web/app/shared/clearable-input/clearable-input.component';
import { DurationStepperComponent } from '@household/web/app/shared/duration-stepper/duration-stepper.component';
import { MatButtonModule } from '@angular/material/button';

export type CustomerJobDialogData = Customer.CustomerId 
& {
  job?: Customer.Job.Response
};
export type CustomerJobDialogResult = Customer.CustomerId 
& Customer.Job.Request 
& {
  jobName: Customer.Job.Name['name']
};

@Component({
  imports: [
    ReactiveFormsModule,
    ClearableInputComponent,
    DurationStepperComponent,
    JobPriceCalculatorComponent,
    MatDialogModule,
    MatButtonModule,
  ],  
  templateUrl: './customer-job-dialog.component.html',
  styleUrl: './customer-job-dialog.component.scss',
})
export class CustomerJobDialogComponent implements OnInit {
  form: FormGroup<{
    name: FormControl<string>;
    description: FormControl<string>;
    duration: FormControl<number>;
    prices: FormControl<Required<JobPriceCalculatorValue>[]>;
  }>;
  prices: Observable<Price.Response[]>;
  total: number;
  
  constructor(private dialogRef: MatDialogRef<CustomerJobDialogComponent, CustomerJobDialogResult>,
    private store: Store,
    @Inject(MAT_DIALOG_DATA) public data: CustomerJobDialogData) { }

  ngOnInit(): void {
    this.prices = this.store.select(selectPriceList);
  
    this.form = new FormGroup({
      name: new FormControl(this.data.job?.name, [Validators.required]),
      description: new FormControl(this.data.job?.description),
      duration: new FormControl(this.data.job?.duration ?? 1, [
        Validators.required,
        Validators.min(1),
      ]),
      prices: new FormControl(this.data.job?.prices.map((priceResponse) => {
        if (priceResponse.priceId) {
          const { quantity, ...price } = priceResponse;
          return {
            price,
            quantity,
            amount: null,
            name: null,
          };  
        }
    
        return {
          price: null,
          quantity: null,
          amount: priceResponse.amount,
          name: priceResponse.name,
        };
      }) ?? [], [Validators.required]),
    });
  }
    
  onSetDuration(diff: number) {
    this.form.patchValue({
      duration: this.form.value.duration + diff,
    }, {
      emitEvent: false,
    });
  }
      
  onSave() {
    if (this.form.valid) {
      this.dialogRef.close({
        name: this.form.value.name,
        description: this.form.value.description?.trim() ?? undefined,
        duration: this.form.value.duration,
        prices: this.form.value.prices.map((p) => {
          if (p.price) {
            return {
              priceId: p.price.priceId,
              quantity: p.quantity,
            };
          } 
    
          return {
            name: p.name,
            amount: p.amount,
          };
        }),
        customerId: this.data.customerId,
        jobName: this.data.job?.name,
      });
    }
  }
}
