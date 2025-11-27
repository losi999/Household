import { AsyncPipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { Price } from '@household/shared/types/types';
import { priceActions } from '@household/web/app/hairdressing/price/state/price.actions';
import { selectPriceIsInProgress } from '@household/web/state/progress/progress.selector';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

@Component({
  selector: 'household-price-list-item',
  imports: [
    MatListModule,
    AsyncPipe,
  ],  
  templateUrl: './price-list-item.component.html',
  styleUrl: './price-list-item.component.scss',
})
export class PriceListItemComponent implements OnInit {
  @Input() price: Price.Response;

  constructor(private store: Store) { }
    
  isDisabled: Observable<boolean>;

  ngOnInit(): void {
    this.isDisabled = this.store.select(selectPriceIsInProgress(this.price.priceId));
  }

  onShowMenu() {
    this.store.dispatch(priceActions.openPriceListItemSubmenu(this.price));
  }
}
