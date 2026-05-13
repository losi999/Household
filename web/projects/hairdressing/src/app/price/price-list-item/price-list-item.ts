import { Component, computed, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { priceEvents } from '@hairdressing/state/price/price-events';
import { PriceStore } from '@hairdressing/state/price/price-store';
import { Price } from '@household/shared/types/types';
import { injectDispatch } from '@ngrx/signals/events';

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
  private priceEvents = injectDispatch(priceEvents);
  private readonly priceStore = inject(PriceStore);
  
  isDisabled = computed(() => {
    return this.priceStore.isInProgress().includes(this.price().priceId);
  });
  
  onShowMenu() {
    this.priceEvents.openPriceListItemSubmenu(this.price());
  }
}
