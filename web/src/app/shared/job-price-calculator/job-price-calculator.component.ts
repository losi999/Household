import { CommonModule } from '@angular/common';
import { Component, forwardRef, OnInit } from '@angular/core';
import { ControlValueAccessor, FormArray, FormControl, FormGroup, NG_VALUE_ACCESSOR, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { Price } from '@household/shared/types/types';
import { ClearableInputComponent } from '@household/web/app/shared/clearable-input/clearable-input.component';
import { MinutesToHourPipe } from '@household/web/app/shared/pipes/minutes-to-hour.pipe';
import { selectPrices } from '@household/web/app/hairdressing/price/state/price.selector';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/internal/Observable';

export type JobPriceCalculatorValue = PriceFormGroup['value'];

type PriceFormGroup = FormGroup<{
  price: FormControl<Price.Response>;
  quantity: FormControl<number>;
  name: FormControl<string>;
  amount: FormControl<number>
}>;

@Component({
  selector: 'household-job-price-calculator',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    ClearableInputComponent,
    ReactiveFormsModule,
    MinutesToHourPipe,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => JobPriceCalculatorComponent),
    },
  ],
  templateUrl: './job-price-calculator.component.html',
  styleUrl: './job-price-calculator.component.scss',
})
export class JobPriceCalculatorComponent implements OnInit, ControlValueAccessor {
  changed: (value: JobPriceCalculatorValue[]) => void;
  touched: () => void;
  isDisabled: boolean;
  form: FormArray<PriceFormGroup>;
  prices: Observable<Price.Response[]>;  
  total: number;
  
  constructor(private store: Store) {}

  ngOnInit(): void {
    this.prices = this.store.select(selectPrices);

    this.form = new FormArray([], [Validators.required]);

    this.calculateTotal(this.form.value);
    
    this.form.valueChanges.subscribe((value) => {
      this.calculateTotal(value);
      this.changed?.(value);
    });
  }

  writeValue(value: JobPriceCalculatorValue[]): void {
    value.forEach(({ amount, name, price, quantity }) => {
      this.form.push(new FormGroup({
        price: new FormControl(price),
        quantity: new FormControl(quantity),
        amount: new FormControl(amount),
        name: new FormControl(name),
      }), {
        emitEvent: false,
      });
    });

    this.calculateTotal(value);
  }

  registerOnChange(fn: any): void {
    this.changed = fn;
  }

  registerOnTouched(fn: any): void {
    this.touched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  private calculateTotal(value: PriceFormGroup['value'][]) {
    this.total = value.reduce((accumulator, currentValue) => {
      if (currentValue.price) {
        return accumulator + currentValue.price.amount * currentValue.quantity;
      }
    
      return accumulator + currentValue.amount;
    }, 0);
  }

  onAddPrice(price: Price.Response) {
    const existingGroup = this.form.controls.find(c => c.value.price?.priceId === price.priceId);
      
    if (existingGroup) {
      existingGroup.patchValue({
        quantity: existingGroup.value.quantity + 1,
      });
    } else { 
      this.form.push(new FormGroup({
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
      this.form.removeAt(index);
    } else {
    
      control.patchValue({
        quantity: newValue,
      });
    }
  }

  onRemovePrice(index: number) {
    this.form.removeAt(index);
  }

  onAddAdditionalPrice() {
    this.form.push(new FormGroup({
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
    
  onRemoveAmount(group: PriceFormGroup) {
    group.patchValue({
      amount: group.value.amount - 100,
    });
  }
}
