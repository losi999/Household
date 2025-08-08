import { Component, Input, OnInit } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Price } from '@household/shared/types/types';
import { HairdressingPriceSubmenuComponent, HairdressingPriceSubmenuData, HairdressingPriceSubmenuResult } from '@household/web/app/hairdressing/hairdressing-price-submenu/hairdressing-price-submenu.component';
import { selectPriceIsInProgress } from '@household/web/state/progress/progress.selector';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

@Component({
  selector: 'household-hairdressing-price-list-item',
  standalone: false,
  
  templateUrl: './hairdressing-price-list-item.component.html',
  styleUrl: './hairdressing-price-list-item.component.scss',
})
export class HairdressingPriceListItemComponent implements OnInit {
  @Input() price: Price.Response;

  constructor(
    private store: Store,
    private bottomSheet: MatBottomSheet) { }
    
  isDisabled: Observable<boolean>;

  ngOnInit(): void {
    this.isDisabled = this.store.select(selectPriceIsInProgress(this.price.priceId));
  }

  showMenu() {
    this.bottomSheet.open<HairdressingPriceSubmenuComponent, HairdressingPriceSubmenuData, HairdressingPriceSubmenuResult>(HairdressingPriceSubmenuComponent, {
      data: this.price,
    });

  }
}
