import { Component, Input, OnInit } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Category } from '@household/shared/types/types';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { CatalogSubmenuComponent, CatalogSubmenuData, CatalogSubmenuResult } from 'src/app/shared/catalog-submenu/catalog-submenu.component';
import { DialogService } from 'src/app/shared/dialog.service';
import { categoryApiActions } from 'src/app/state/category/category.actions';
import { selectCategoryIsInProgress } from 'src/app/state/progress/progress.selector';

@Component({
  selector: 'household-category-list-item',
  templateUrl: './category-list-item.component.html',
  styleUrls: ['./category-list-item.component.scss'],
})
export class CategoryListItemComponent implements OnInit {
  @Input() category: Category.Response;
  constructor(
    private store: Store,
    private dialogService: DialogService,
    private bottomSheet: MatBottomSheet) { }

  isDisabled: Observable<boolean>;

  ngOnInit(): void {
    this.isDisabled = this.store.select(selectCategoryIsInProgress(this.category.categoryId));
  }

  delete() {
    this.dialogService.openDeleteCategoryDialog(this.category).afterClosed()
      .subscribe(shouldDelete => {
        if (shouldDelete) {
          this.store.dispatch(categoryApiActions.deleteCategoryInitiated({
            categoryId: this.category.categoryId,
          }));
        }
      });
  }

  edit() {
    this.dialogService.openEditCategoryDialog(this.category);
  }

  merge() {
    this.dialogService.openMergeCategoriesDialog(this.category);
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
