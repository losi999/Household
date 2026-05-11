import { Component, computed, inject, input, model, signal } from '@angular/core';
import { FormValueControl, SchemaPath, validate, ValidationError } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MinutesToHourPipe } from '@hairdressing/app/pipes/minutes-to-hour-pipe';
import { PriceAutocompleteInput } from '@hairdressing/app/price/price-autocomplete-input/price-autocomplete-input';
import { selectPriceList } from '@hairdressing/state/price/price-selector';
import { Price } from '@household/shared/types/types';
import { Store } from '@ngrx/store';

export const requiredPrices = (field: SchemaPath<JobPriceCalculatorValue>, min: number, config?: {message: string}) => {
  validate(field, (ctx) => {
    const value = ctx.value();

    if (value.prices.length > 0) {
      return null;
    }

    return {
      kind: 'requiredPrices',
      message: config?.message,
    };
  });
};

export type JobPriceCalculatorValue = {
  prices: {
    price: Price.Response;
    quantity: number;
  }[]
  additionalPrice: number;
};

@Component({
  selector: 'hairdressing-job-price-calculator',
  imports: [
    MatButtonModule,
    MatIconModule,
    MinutesToHourPipe,
    MatDividerModule,
    MatFormFieldModule,
    PriceAutocompleteInput,
  ],
  templateUrl: './job-price-calculator.html',
  styleUrl: './job-price-calculator.scss',
})
export class JobPriceCalculator implements FormValueControl<JobPriceCalculatorValue> {
  value = model<JobPriceCalculatorValue>();
  errors = input<readonly ValidationError.WithOptionalFieldTree[]>([]);
  touched = input(false);
  _touched = signal(false);

  private store = inject(Store);

  prices = this.store.selectSignal(selectPriceList);

  excludedPriceIds = computed(() => {
    return this.value().prices
      .map(p => p.price?.priceId)
      .filter(p => p);
  });

  selectedPrice = model<Price.Response>();

  total = computed(() => {
    return this.value().prices.reduce((accumulator, currentValue) => {
      return accumulator + (currentValue.price.amount * currentValue.quantity);
    }, 0) + (this.value().additionalPrice ?? 0);
  });

  additionalPriceIncrements = signal([
    -5000,
    -1000,
    -500,
    -100,
    100,
    500,
    1000,
    5000,
  ]);
  
  onAddPrice() {
    const price = this.selectedPrice();
    if (!price) {
      return;
    }

    this._touched.set(true);
    this.selectedPrice.set(undefined);
    const existingGroup = this.value().prices.find(c => c.price?.priceId === price.priceId);

    if (existingGroup) {
      this.value.update((current) => {
        return {
          ...current,
          prices: current.prices.map((priceValue) => {
            if (priceValue.price?.priceId === price.priceId) {
              return {
                ...priceValue,
                quantity: priceValue.quantity + 1,
              };
            }
  
            return priceValue;
          }),
        };
      });
    } else {
      this.value.update((current) => {
        return {
          ...current,
          prices: [
            ...current.prices,
            {
              price: price,
              quantity: 1,
            },
          ],
        };
      }); 
    }
  }

  onAddQuantity(index: number) {
    this._touched.set(true);
    this.value.update((current) => {
      return {
        ...current,
        prices: current.prices.map((priceValue, i) => {
          if (i === index) {
            return {
              ...priceValue,
              quantity: priceValue.quantity + (priceValue.price.unitOfMeasurement === 'óra' ? 0.25 : 1),
            };
          }
          return priceValue;
        }),
      };
    });
  }
    
  onRemoveQuantity(index: number) {
    this._touched.set(true);
    this.value.update((current) => {
      return {
        ...current,
        prices: current.prices.map((priceValue, i) => {
          if (i === index) {
            return {
              ...priceValue,
              quantity: priceValue.quantity - (priceValue.price.unitOfMeasurement === 'óra' ? 0.25 : 1),
            };
          }
          return priceValue;
        }).filter(pv => pv.quantity > 0),
      };
    });
  }

  onRemovePrice(index: number) {
    this._touched.set(true);
    this.value.update((current) => {
      return {
        ...current,
        prices: current.prices.toSpliced(index, 1),
      };
    });
  }

  onAddAmount(amount: number) {
    this._touched.set(true);
    this.value.update((current) => {
      return {
        ...current,
        additionalPrice: (current.additionalPrice ?? 0) + amount,
      };
    });
  }
}
