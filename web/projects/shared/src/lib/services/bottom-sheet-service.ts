import { inject, Injectable } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { BottomSubmenu, BottomSubmenuData } from './../bottom-submenu/bottom-submenu';

@Injectable({
  providedIn: 'root',
})
export class BottomSheetService {
  private bottomSheet = inject(MatBottomSheet);

  private itemMapping = {
    edit: {
      icon: 'edit',
      label: 'Szerkesztés',
    },
    delete: {
      icon: 'delete',
      label: 'Törlés',
    },
    merge: {
      icon: 'merge',
      label: 'Egyesítés',
    },
  };

  openBottomSubmenu<I extends keyof typeof this.itemMapping>(title: string, ...items: I[]) {
    return this.bottomSheet.open<BottomSubmenu, BottomSubmenuData, I>(BottomSubmenu, {
      data: {
        title,
        items: items.map((i) => {
          return {
            action: i,
            icon: this.itemMapping[i].icon,
            label: this.itemMapping[i].label,
          };
        }),
      },
    });
  }
  
}
