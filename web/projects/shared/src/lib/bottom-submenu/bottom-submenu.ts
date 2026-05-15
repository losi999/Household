import { Component, inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

export type BottomSubmenuItem = 'edit' | 'delete' | 'merge';

export type BottomSubmenuData = {
  title: string;
  items: {
    action: string;
    icon: string;
    label: string
  }[]
};

@Component({
  imports: [
    MatListModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './bottom-submenu.html',
  styleUrls: ['./bottom-submenu.scss'],
})
export class BottomSubmenu {
  private bottomSheetRef = inject(MatBottomSheetRef<BottomSubmenu, string>);
  public data = inject<BottomSubmenuData>(MAT_BOTTOM_SHEET_DATA);
  
  onSelect(action: string) {
    this.bottomSheetRef.dismiss(action);
  }
}
