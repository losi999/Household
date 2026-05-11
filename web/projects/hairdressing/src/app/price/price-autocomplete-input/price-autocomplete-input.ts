import { Component, effect, inject, input, model, signal } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Store } from '@ngrx/store';
import { Price } from '@household/shared/types/types';
import { selectPriceList } from '@hairdressing/state/price/price-selector';
import { FormValueControl, ValidationError } from '@angular/forms/signals';
import { FormsModule } from '@angular/forms';
import { priceActions } from '@hairdressing/state/price/price-actions';
import { SignalErrorStateMatcher } from '@household/shared-ui';

@Component({
  selector: 'hairdressing-price-autocomplete-input',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatAutocompleteModule,
    FormsModule,
  ],
  templateUrl: './price-autocomplete-input.html',
  styleUrl: './price-autocomplete-input.scss',
})
export class PriceAutocompleteInput implements FormValueControl<Price.Response> {
  value = model<Price.Response>();

  touched = model<boolean>(false);

  required = input(false);
  errors = input<readonly ValidationError.WithOptionalFieldTree[]>([]);

  label = input.required<string>();
  exclude = input<Price.Id[]>([]);
  
  matcher = new SignalErrorStateMatcher(this.touched);

  private store = inject(Store);

  private prices = this.store.selectSignal(selectPriceList);

  filterValue = signal<string>('');

  filteredPrices = signal<Price.Response[]>([]);

  constructor() {
    effect(() => {
      this.matcher.showError.set(this.errors().length > 0);
    });
    
    effect(() => {
      this.filterValue.set(this.value()?.name ?? '');
    });
    
    effect(() => {
      const filteredPrices = this.prices()?.filter((c) => {        
        if (this.exclude()?.includes(c.priceId)) {
          return false;
        }
        const terms = this.filterValue().toLowerCase()
          .split(' ');
        
        if (terms.every(t => c.searchTerms?.some(s => s.includes(t)))) {
          return true;
        }
        
        return false;
        
      }) ?? [];
      this.filteredPrices.set(filteredPrices);
    
    });
  }

  clearValue(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.value.set(null);
  }

  optionSelected(input: HTMLInputElement) {
    setTimeout(() => input.blur());
  }

  onBlur() {
    if (this.value()?.name !== this.filterValue()) {
      this.value.set(null);
    }
  }

  create(event: MouseEvent) {
    this.store.dispatch(priceActions.createPrice());
    event.stopPropagation();
  }
}
