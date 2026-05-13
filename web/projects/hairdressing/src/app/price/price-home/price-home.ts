import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PriceList } from '@hairdressing/app/price/price-list/price-list';
import { Toolbar } from '@hairdressing/app/shared/toolbar/toolbar';
import { priceApiEvents, priceEvents } from '@hairdressing/state/price/price-events';
import { PriceStore } from '@hairdressing/state/price/price-store';
import { injectDispatch } from '@ngrx/signals/events';

@Component({
  selector: 'hairdressing-price-home',
  imports: [
    Toolbar,
    MatIconModule,
    MatButtonModule,
    PriceList,
  ],
  templateUrl: './price-home.html',
  styleUrls: ['./price-home.scss'],
})
export class PriceHome {
  readonly priceStore = inject(PriceStore);
  private readonly priceApiEvents = injectDispatch(priceApiEvents);
  private readonly priceEvents = injectDispatch(priceEvents);

  constructor() {
    this.priceApiEvents.listPricesInitiated();
  }

  onCreate() {
    this.priceEvents.createPrice();
  }
}
