import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';

export type BottomSubmenuData = {
  title: string;
  actions: {
    icon: string;
    text: string;
    name: string;
  }[]
};

@Component({
  selector: 'household-bottom-submenu',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatListModule,
  ],
  templateUrl: './bottom-submenu.component.html',
  styleUrl: './bottom-submenu.component.scss',
})
export class BottomSubmenuComponent {

  constructor(private bottomSheetRef: MatBottomSheetRef<BottomSubmenuComponent, string>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: BottomSubmenuData) { }

  onClick(name: string) {
    this.bottomSheetRef.dismiss(name);
  }
}
