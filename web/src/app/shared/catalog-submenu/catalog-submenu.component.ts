import { Component, Inject } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

export type CatalogSubmenuData = string;
export type CatalogSubmenuResult = 'edit' | 'delete' | 'merge';

@Component({
  selector: 'app-catalog-submenu',
  templateUrl: './catalog-submenu.component.html',
  styleUrls: ['./catalog-submenu.component.scss'],
})
export class CatalogSubmenuComponent {

  constructor(private bottomSheetRef: MatBottomSheetRef<CatalogSubmenuComponent, CatalogSubmenuResult>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public title: CatalogSubmenuData) { }

  edit() {
    this.bottomSheetRef.dismiss('edit');
  }

  delete() {
    this.bottomSheetRef.dismiss('delete');
  }

  merge() {
    this.bottomSheetRef.dismiss('merge');
  }

}
