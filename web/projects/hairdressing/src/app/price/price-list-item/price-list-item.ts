import { Component, effect, inject, input, Signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { priceActions } from '@hairdressing/state/price/price-actions';
import { selectPriceIsInProgress } from '@hairdressing/state/price/price-selector';
import { Price } from '@household/shared/types/types';
import { Store } from '@ngrx/store';

@Component({
  selector: 'hairdressing-price-list-item',
  imports: [
    MatButtonModule,
    MatListModule,
  ],
  templateUrl: './price-list-item.html',
  styleUrl: './price-list-item.scss',
})
export class PriceListItem {
  price = input.required<Price.Response>();
  
  private store = inject(Store);
  
  isDisabled: Signal<boolean>;

  constructor() {
    effect(() => {
      this.isDisabled = this.store.selectSignal(selectPriceIsInProgress(this.price().priceId));
    });
  }
  
  onShowMenu() {
    this.store.dispatch(priceActions.openPriceListItemSubmenu(this.price()));
  }
}
