import { Component, Input, OnInit } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Price } from '@household/shared/types/types';
import { PriceSubmenuComponent, HairdressingPriceSubmenuData, HairdressingPriceSubmenuResult } from '@household/web/app/hairdressing/price/price-submenu/price-submenu.component';
import { selectPriceIsInProgress } from '@household/web/state/progress/progress.selector';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

@Component({
  selector: 'household-price-list-item',
  standalone: false,
  
  templateUrl: './price-list-item.component.html',
  styleUrl: './price-list-item.component.scss',
})
export class PriceListItemComponent implements OnInit {
  @Input() price: Price.Response;

  constructor(
    private store: Store,
    private bottomSheet: MatBottomSheet) { }
    
  isDisabled: Observable<boolean>;

  ngOnInit(): void {
    this.isDisabled = this.store.select(selectPriceIsInProgress(this.price.priceId));
  }

  showMenu() {
    this.bottomSheet.open<PriceSubmenuComponent, HairdressingPriceSubmenuData, HairdressingPriceSubmenuResult>(PriceSubmenuComponent, {
      data: this.price,
    });

  }
}
