import { Component, inject, signal } from '@angular/core';
import { form, FormField, minLength, required } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DurationStepper } from '@hairdressing/app/shared/duration-stepper/duration-stepper';
import { JobPriceCalculator, JobPriceCalculatorValue } from '@hairdressing/app/shared/job-price-calculator/job-price-calculator';
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

  customerJobModel = signal<Omit<Customer.Job.Request, 'prices'> & { prices: JobPriceCalculatorValue[] }>({
    name: this.data.job?.name ?? '',
    description: this.data.job?.description ?? '',
    duration: this.data.job?.duration ?? 1,
    prices: this.data.job?.prices.map((priceResponse) => {
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
    }) ?? [],
  });

  customerJobForm = form(this.customerJobModel, (schemaPath) => {
    required(schemaPath.name, {
      message: 'Kötelező',
    });
    minLength(schemaPath.prices, 1, {
      message: 'Legalább egy ár megadása kötelező',
    });
  });

  onSave() {
    Object.values(this.customerJobForm).forEach(field => {
      field().markAsTouched();
    });

    if (this.customerJobForm().valid()) {
      this.dialogRef.close({
        name: this.customerJobForm.name().value(),
        description: toUndefined(this.customerJobForm.description().value()),
        duration: this.customerJobForm.duration().value(),
        prices: this.customerJobForm.prices().value()
          .map((p) => {
            if (p.price) {
              return {
                priceId: p.price.priceId,
                quantity: p.quantity,
              };
            }

            return {
              amount: p.amount,
              name: toUndefined(p.name),
            };
          }),
        jobName: this.data.job?.name,
        customerId: this.data.customerId,
      });
    }
  }
}
