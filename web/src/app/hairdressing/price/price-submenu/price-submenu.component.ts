import { Component, Inject } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { Price } from '@household/shared/types/types';
import { dialogActions } from '@household/web/state/dialog/dialog.actions';
import { Store } from '@ngrx/store';
export type HairdressingPriceSubmenuData = Price.Response;
export type HairdressingPriceSubmenuResult = void;

@Component({
  standalone: false,  
  templateUrl: './price-submenu.component.html',
  styleUrl: './price-submenu.component.scss',
})
export class PriceSubmenuComponent {
  constructor(private bottomSheetRef: MatBottomSheetRef<PriceSubmenuComponent, HairdressingPriceSubmenuResult>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public price: HairdressingPriceSubmenuData,
    private store: Store) { }

  edit() {
    this.store.dispatch(dialogActions.updatePrice(this.price));
    this.bottomSheetRef.dismiss();
  }

  delete() {
    this.store.dispatch(dialogActions.deletePrice(this.price));
    this.bottomSheetRef.dismiss();
  }
}
