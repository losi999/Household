import { Component, computed, effect, inject, input, model, signal } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Price } from '@household/shared/types/types';
import { FormValueControl, ValidationError } from '@angular/forms/signals';
import { FormsModule } from '@angular/forms';
import { SignalErrorStateMatcher } from '@household/shared-ui';
import { PriceStore } from '@hairdressing/state/price/price-store';
import { injectDispatch } from '@ngrx/signals/events';
import { priceEvents } from '@hairdressing/state/price/price-events';

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
  private priceStore = inject(PriceStore);
  private priceEvents = injectDispatch(priceEvents);

  value = model<Price.Response>();

  touched = model<boolean>(false);

  required = input(false);
  errors = input<readonly ValidationError.WithOptionalFieldTree[]>([]);

  label = input.required<string>();
  exclude = input<Price.Id[]>([]);
  
  matcher = new SignalErrorStateMatcher(this.touched);

  filterValue = signal<string>('');

  filteredPrices = computed(() => {
    return this.priceStore.priceList()?.filter((c) => {        
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
  });

  constructor() {
    effect(() => {
      this.matcher.showError.set(this.errors().length > 0);
    });
    
    effect(() => {
      this.filterValue.set(this.value()?.name ?? '');
    });
  }

  clearValue(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.value.set(null);
  }

  optionSelected(input: HTMLInputElement) {
    console.log('onselected');
    setTimeout(() => input.blur());
  }

  onBlur() {
    if (!this.value()) {
      return;
    }

    if (this.value().name !== this.filterValue()) {
      this.value.set(null);
    }
  }

  create(event: MouseEvent) {
    this.priceEvents.createPrice();
    event.stopPropagation();
  }
}
