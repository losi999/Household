import { Component, inject, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DurationStepper } from '@hairdressing/app/shared/duration-stepper/duration-stepper';
import { JobPriceCalculator, JobPriceCalculatorValue, requiredPrices } from '@hairdressing/app/shared/job-price-calculator/job-price-calculator';
import { selectPriceList } from '@hairdressing/state/price/price-selector';
import { ClearableInput } from '@household/shared-ui';
import { toUndefined } from '@household/shared/common/utils';
import { Customer } from '@household/shared/types/types';
import { Store } from '@ngrx/store';

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
    ClearableInput,
    DurationStepper,
    JobPriceCalculator,
    MatDialogModule,
    MatButtonModule,
    FormField,
  ],
  templateUrl: './customer-job-dialog.html',
  styleUrl: './customer-job-dialog.scss',
})
export class CustomerJobDialog {
  private dialogRef = inject<MatDialogRef<CustomerJobDialog, CustomerJobDialogResult>>(MatDialogRef);
  private store = inject(Store);
  public data = inject<CustomerJobDialogData>(MAT_DIALOG_DATA);

  prices = this.store.selectSignal(selectPriceList);

  customerJobModel = signal<Omit<Customer.Job.Request, 'prices' | 'additionalPrice'> & { cost: JobPriceCalculatorValue }>({
    name: this.data.job?.name ?? '',
    description: this.data.job?.description ?? '',
    duration: this.data.job?.duration ?? 1,
    cost: {
      additionalPrice: this.data.job?.additionalPrice ?? 0,
      prices: this.data.job?.prices.map((priceResponse) => {
        const { quantity, ...price } = priceResponse;
        return {
          price,
          quantity,
        };
      
      }) ?? [],
    },    
  });

  customerJobForm = form(this.customerJobModel, (schemaPath) => {
    required(schemaPath.name, {
      message: 'Kötelező',
    });
    requiredPrices(schemaPath.cost, 1, {
      message: 'Legalább egy ár megadása kötelező',
    });
  });

  onSave() {
    Object.values(this.customerJobForm).forEach(field => {
      field().markAsTouched();
    });

    console.log(this.customerJobForm.cost().errors());

    if (this.customerJobForm().valid()) {
      this.dialogRef.close({
        name: this.customerJobForm.name().value(),
        description: toUndefined(this.customerJobForm.description().value()
          ?.trim()),
        duration: this.customerJobForm.duration().value(),
        additionalPrice: this.customerJobForm.cost().value().additionalPrice,
        prices: this.customerJobForm.cost().value().prices
          .map((p) => {
            return {
              priceId: p.price.priceId,
              quantity: p.quantity,
            };
          }),
        jobName: this.data.job?.name,
        customerId: this.data.customerId,
      });
    }
  }
}
