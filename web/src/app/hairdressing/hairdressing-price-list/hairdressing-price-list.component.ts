import { Component, OnInit } from '@angular/core';
import { Price } from '@household/shared/types/types';
import { dialogActions } from '@household/web/state/dialog/dialog.actions';
import { priceApiActions } from '@household/web/state/price/price.actions';
import { selectPriceList } from '@household/web/state/price/price.selector';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

@Component({
  selector: 'household-hairdressing-price-list',
  standalone: false,  
  templateUrl: './hairdressing-price-list.component.html',
  styleUrl: './hairdressing-price-list.component.scss',
})
export class HairdressingPriceListComponent implements OnInit {
  prices: Observable<Price.Response[]>;

  constructor(private store: Store) {}
  
  ngOnInit(): void {
    this.prices = this.store.select(selectPriceList);

    this.store.dispatch(priceApiActions.listPricesInitiated());
  }

  create() {
    this.store.dispatch(dialogActions.createPrice());
  }
}
