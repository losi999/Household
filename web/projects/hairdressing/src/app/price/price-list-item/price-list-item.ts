import { Component, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { priceActions } from '@hairdressing/state/price/price-actions';
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

  onShowMenu() {
    this.store.dispatch(priceActions.openPriceListItemSubmenu(this.price()));
  }
}
