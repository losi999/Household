import { Component, computed, inject, input, model, signal } from '@angular/core';
import { FormValueControl, ValidationError } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MinutesToHourPipe } from '@hairdressing/app/pipes/minutes-to-hour-pipe';
import { PriceAutocompleteInput } from '@hairdressing/app/price/price-autocomplete-input/price-autocomplete-input';
import { selectPriceList } from '@hairdressing/state/price/price-selector';
import { ClearableInput } from '@household/shared-ui';
import { Price } from '@household/shared/types/types';
import { Store } from '@ngrx/store';

export type JobPriceCalculatorValue = {
  price: Price.Response;
  quantity: number;
  name: string;
  amount: number;
};

@Component({
  selector: 'hairdressing-job-price-calculator',
  imports: [
    MatButtonModule,
    MatIconModule,
    MinutesToHourPipe,
    ClearableInput,
    MatDividerModule,
    MatFormFieldModule,
    PriceAutocompleteInput,
  ],
  templateUrl: './job-price-calculator.html',
  styleUrl: './job-price-calculator.scss',
})
export class JobPriceCalculator implements FormValueControl<JobPriceCalculatorValue[]> {
  value = model<JobPriceCalculatorValue[]>([]);
  errors = input<readonly ValidationError.WithOptionalFieldTree[]>([]);
  touched = input(false);
  _touched = signal(false);

  private store = inject(Store);

  prices = this.store.selectSignal(selectPriceList);

  excludedPriceIds = computed(() => {
    return this.value()
      .map(p => p.price?.priceId)
      .filter(p => p);
  });

  selectedPrice = model<Price.Response>();

  total = computed(() => {
    return this.value().reduce((accumulator, currentValue) => {
      if (currentValue.price) {
        return accumulator + (currentValue.price.amount * currentValue.quantity);
      }
      return accumulator + currentValue.amount;
    }, 0);
  });
  
  onAddPrice() {
    const price = this.selectedPrice();
    if (!price) {
      return;
    }

    this._touched.set(true);
    this.selectedPrice.set(undefined);
    const existingGroup = this.value().find(c => c.price?.priceId === price.priceId);

    if (existingGroup) {
      this.value.update((current) => {
        return current.map((priceValue) => {
          if (priceValue.price?.priceId === price.priceId) {
            return {
              ...priceValue,
              quantity: priceValue.quantity + 1,
            };
          }
  
          return priceValue;
        });      
      });
    } else {
      this.value.update((current) => {
        return [
          ...current,
          {
            price: price,
            quantity: 1,
            name: null,
            amount: null,
          },
        ];
      }); 
    }
  }

  onAddQuantity(index: number) {
    this._touched.set(true);
    this.value.update((current) => {
      return current.map((priceValue, i) => {
        if (i === index) {
          return {
            ...priceValue,
            quantity: priceValue.quantity + (priceValue.price.unitOfMeasurement === 'óra' ? 0.25 : 1),
          };
        }
        return priceValue;
      });
    });
  }
    
  onRemoveQuantity(index: number) {
    this._touched.set(true);
    this.value.update((current) => {
      return current.map((priceValue, i) => {
        if (i === index) {
          return {
            ...priceValue,
            quantity: priceValue.quantity - (priceValue.price.unitOfMeasurement === 'óra' ? 0.25 : 1),
          };
        }
        return priceValue;
      }).filter(pv => pv.quantity > 0 || pv.amount > 0);
    });
  }

  onRemovePrice(index: number) {
    this._touched.set(true);
    this.value.update((current) => {
      return current.toSpliced(index, 1);
    });
  }

  onAddAdditionalPrice() {
    this._touched.set(true);
    this.value.update((current) => {
      return [
        ...current,
        {
          price: null,
          quantity: null,
          name: '',
          amount: 100,
        },
      ];
    }); 
  }

  onAddAmount(index: number) {
    this._touched.set(true);
    this.value.update((current) => {
      return current.map((priceValue, i) => {
        if (i === index) {
          return {
            ...priceValue,
            amount: priceValue.amount + 100,
          };
        }
        return priceValue;
      });
    });
  }
    
  onRemoveAmount(index: number) {
    this._touched.set(true);
    this.value.update((current) => {
      return current.map((priceValue, i) => {
        if (i === index) {
          return {
            ...priceValue,
            amount: priceValue.amount - 100,
          };
        }
        return priceValue;
      });
    });
  }
}
