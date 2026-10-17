import { inject, Injectable } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { BottomSubmenu, BottomSubmenuData } from './../bottom-submenu/bottom-submenu';

export type BottomSubmenuItem = {
  action?: string;
  link?: string;
  icon: string;
  label: string;
};

@Injectable({
  providedIn: 'root',
})
export class BottomSheetService {
  static Edit = {
    action: 'edit',
    icon: 'edit',
    label: 'Szerkesztés',
  } as const satisfies BottomSubmenuItem;

  static Delete = {
    action: 'delete',
    icon: 'delete',
    label: 'Törlés',
  } as const satisfies BottomSubmenuItem;

  static Merge = {
    action: 'merge',
    icon: 'merge',
    label: 'Egyesítés',
  } as const satisfies BottomSubmenuItem;

  private bottomSheet = inject(MatBottomSheet);

  openBottomSubmenu<const I extends BottomSubmenuItem[]>(title: string, items: I) {
    return this.bottomSheet.open<BottomSubmenu, BottomSubmenuData, I[number]['action']>(BottomSubmenu, {
      data: {
        title,
        items,
      },
    });
  }
}
