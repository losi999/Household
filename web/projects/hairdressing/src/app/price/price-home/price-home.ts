import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PriceList } from '@hairdressing/app/price/price-list/price-list';
import { Toolbar } from '@hairdressing/app/shared/toolbar/toolbar';
import { priceActions, priceApiActions } from '@hairdressing/state/price/price-actions';
import { selectPriceList } from '@hairdressing/state/price/price-selector';
import { Store } from '@ngrx/store';

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
export class PriceHome implements OnInit {
  private store = inject(Store);

  prices = this.store.selectSignal(selectPriceList);
  
  ngOnInit(): void {
    this.store.dispatch(priceApiActions.listPricesInitiated());
  }

  onCreate() {
    this.store.dispatch(priceActions.createPrice());
  }

}
