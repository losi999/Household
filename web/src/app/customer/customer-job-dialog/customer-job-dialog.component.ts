import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { isListedPrice } from '@household/shared/common/type-guards';
import { Customer, Price } from '@household/shared/types/types';
import { customerApiActions } from '@household/web/state/customer/customer.actions';
import { selectPriceList } from '@household/web/state/hairdressing/hairdressing.selector';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

export type CustomerJobDialogData = Customer.CustomerId & {
  job?: Customer.Job.Response
};

type PriceFormGroup = FormGroup<{
  price: FormControl<Price.Response>;
  quantity: FormControl<number>;
  name: FormControl<string>;
  amount: FormControl<number>
}>;

@Component({
  selector: 'household-customer-job-dialog',
  standalone: false,  
  templateUrl: './customer-job-dialog.component.html',
  styleUrl: './customer-job-dialog.component.scss',
})
export class CustomerJobDialogComponent implements OnInit {
  form: FormGroup<{
    name: FormControl<string>;
    description: FormControl<string>;
    duration: FormControl<number>;
    prices: FormArray<PriceFormGroup>;
  }>;
  prices: Observable<Price.Response[]>;
  total: number;
  
  constructor(private dialogRef: MatDialogRef<CustomerJobDialogComponent, void>,
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
      prices: new FormArray(this.data.job?.prices.map((priceResponse) => {
        if (isListedPrice(priceResponse)) {
          const { quantity, ...price } = priceResponse;
          return new FormGroup({
            price: new FormControl(price),
            quantity: new FormControl(quantity),
            amount: new FormControl(null),
            name: new FormControl(null),
          });  
        }
    
        return new FormGroup({
          price: new FormControl(null),
          quantity: new FormControl(null),
          amount: new FormControl(priceResponse.amount),
          name: new FormControl(priceResponse.name),
        });
      }) ?? [], [Validators.required]),
    });
    
    this.calculateTotal(this.form.value.prices);
    
    this.form.controls.prices.valueChanges.subscribe((value) => {
      this.calculateTotal(value);
    });
  
  }
  
  private calculateTotal(value: PriceFormGroup['value'][]) {
    this.total = value.reduce((accumulator, currentValue) => {
      if (currentValue.price) {
        return accumulator + currentValue.price.amount * currentValue.quantity;
      }
    
      return accumulator + currentValue.amount;
    }, 0);
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
      const request: Customer.Job.Request = {
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
    
  onAddPrice(price: Price.Response) {
    const existingGroup = this.form.controls.prices.controls.find(c => c.value.price?.priceId === price.priceId);
    
    if (existingGroup) {
      existingGroup.patchValue({
        quantity: existingGroup.value.quantity + 1,
      });
    } else { 
      this.form.controls.prices.push(new FormGroup({
        price: new FormControl(price),
        quantity: new FormControl(1),
        amount: new FormControl(),
        name: new FormControl(),
      }));
    }
  }
    
  onAddQuantity(control: PriceFormGroup) {
    control.patchValue({
      quantity: control.value.quantity + (control.value.price.unitOfMeasurement === 'óra' ? 0.25 : 1),
    });
  }
    
  onRemoveQuantity(control: PriceFormGroup, index: number) {
    const newValue = control.value.quantity - (control.value.price.unitOfMeasurement === 'óra' ? 0.25 : 1);
    if (newValue <= 0) {
      this.form.controls.prices.removeAt(index);
    } else {
    
      control.patchValue({
        quantity: newValue,
      });
    }
  }
    
  onRemovePrice(index: number) {
    this.form.controls.prices.removeAt(index);
  }
    
  onAddAdditionalPrice() {
    this.form.controls.prices.push(new FormGroup({
      price: new FormControl(),
      quantity: new FormControl(),
      amount: new FormControl(100),
      name: new FormControl(null, [Validators.required]),
    }));
  }
    
  onAddAmount(group: PriceFormGroup) {
    group.patchValue({
      amount: group.value.amount + 100,
    });
  }
    
  onRemoveAmount(control: PriceFormGroup) {
    control.patchValue({
      amount: control.value.amount - 100,
    });
  }

}
