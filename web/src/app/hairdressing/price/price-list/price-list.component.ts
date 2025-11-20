import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { Price } from '@household/shared/types/types';
import { priceActions, priceApiActions } from '@household/web/app/hairdressing/price/state/price.actions';
import { selectPriceList } from '@household/web/app/hairdressing/price/state/price.selector';
import { ToolbarComponent } from '@household/web/app/shared/toolbar/toolbar.component';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

@Component({
  selector: 'household-price-list',
  imports: [
    ToolbarComponent,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    AsyncPipe,
  ],  
  templateUrl: './price-list.component.html',
  styleUrl: './price-list.component.scss',
})
export class PriceListComponent implements OnInit {
  prices: Observable<Price.Response[]>;

  constructor(private store: Store) {}
  
  ngOnInit(): void {
    this.prices = this.store.select(selectPriceList);

    this.store.dispatch(priceApiActions.listPricesInitiated());
  }

  onCreate() {
    this.store.dispatch(priceActions.createPrice());
  }
}
