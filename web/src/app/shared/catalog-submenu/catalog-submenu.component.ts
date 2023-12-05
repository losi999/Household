import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
export type CatalogSubmenuData = string;
export type CatalogSubmenuResult = 'edit' | 'delete' | 'merge';

@Component({
  selector: 'household-catalog-submenu',
  templateUrl: './catalog-submenu.component.html',
  styleUrls: ['./catalog-submenu.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatListModule,
  ],
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
