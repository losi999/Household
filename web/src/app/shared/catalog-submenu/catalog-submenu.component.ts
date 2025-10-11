import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

export type CatalogSubmenuData = {
  title: string;
  hideEdit?: boolean;
  hideDelete?: boolean;
  hideMerge?: boolean;
};
export enum CatalogSubmenuResult {
  Edit= 'edit',
  Delete = 'delete',
  Merge = 'merge',
}

@Component({
  selector: 'household-catalog-submenu',
  templateUrl: './catalog-submenu.component.html',
  styleUrls: ['./catalog-submenu.component.scss'],
  imports: [
    CommonModule,
    MatIconModule,
    MatListModule,
  ],
})
export class CatalogSubmenuComponent {

  constructor(private bottomSheetRef: MatBottomSheetRef<CatalogSubmenuComponent, CatalogSubmenuResult>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public config: CatalogSubmenuData) { }

  onSelect(action: CatalogSubmenuResult) {
    this.bottomSheetRef.dismiss(action);
  }
}
