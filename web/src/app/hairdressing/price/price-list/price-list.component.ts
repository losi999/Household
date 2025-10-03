import { Component, OnInit } from '@angular/core';
import { Price } from '@household/shared/types/types';
import { dialogActions } from '@household/web/state/dialog/dialog.actions';
import { priceActions, priceApiActions } from '@household/web/app/hairdressing/price/state/price.actions';
import { selectPrices } from '@household/web/app/hairdressing/price/state/price.selector';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

@Component({
  selector: 'household-price-list',
  standalone: false,  
  templateUrl: './price-list.component.html',
  styleUrl: './price-list.component.scss',
})
export class PriceListComponent implements OnInit {
  prices: Observable<Price.Response[]>;

  constructor(private store: Store) {}
  
  ngOnInit(): void {
    this.prices = this.store.select(selectPrices);

    this.store.dispatch(priceApiActions.listPricesInitiated());
  }

  create() {
    this.store.dispatch(priceActions.createPrice());
  }
}
