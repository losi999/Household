import { inject, Injectable } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { BottomSubmenu, BottomSubmenuData, BottomSubmenuItem } from './../bottom-submenu/bottom-submenu';

@Injectable({
  providedIn: 'root',
})
export class BottomSheetService {
  private bottomSheet = inject(MatBottomSheet);

  openBottomSubmenu<I extends BottomSubmenuItem>(title: string, ...items: I[]) {
    return this.bottomSheet.open<BottomSubmenu, BottomSubmenuData<I>, I>(BottomSubmenu, {
      data: {
        title,
        items,
      },
    });
  }
  
}
