import { Component, Input, OnInit } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Category } from '@household/shared/types/types';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { CatalogSubmenuComponent, CatalogSubmenuData, CatalogSubmenuResult } from '@household/web/app/shared/catalog-submenu/catalog-submenu.component';
import { selectCategoryIsInProgress } from '@household/web/state/progress/progress.selector';
import { dialogActions } from '@household/web/state/dialog/dialog.actions';

@Component({
  selector: 'household-category-list-item',
  templateUrl: './category-list-item.component.html',
  styleUrls: ['./category-list-item.component.scss'],
  standalone: false,
})
export class CategoryListItemComponent implements OnInit {
  @Input() category: Category.Response;
  constructor(
    private store: Store,
    private bottomSheet: MatBottomSheet) { }

  isDisabled: Observable<boolean>;

  ngOnInit(): void {
    this.isDisabled = this.store.select(selectCategoryIsInProgress(this.category));
  }

  delete() {
    this.store.dispatch(dialogActions.deleteCategory(this.category));
  }

  edit() {
    this.store.dispatch(dialogActions.updateCategory(this.category));
  }

  merge() {
    this.store.dispatch(dialogActions.mergeCategories(this.category));
  }

  showMenu() {
    const bottomSheetRef = this.bottomSheet.open<CatalogSubmenuComponent, CatalogSubmenuData, CatalogSubmenuResult>(CatalogSubmenuComponent, {
      data: this.category.name,
    });

    bottomSheetRef.afterDismissed().subscribe((result) => {
      switch (result) {
        case 'delete': this.delete(); break;
        case 'edit': this.edit(); break;
        case 'merge': this.merge(); break;
      }
    });
  }
}
