import { Component, Input } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Category } from '@household/shared/types/types';
import { CategoryService } from 'src/app/category/category.service';
import { CatalogSubmenuComponent, CatalogSubmenuData, CatalogSubmenuResult } from 'src/app/shared/catalog-submenu/catalog-submenu.component';
import { DialogService } from 'src/app/shared/dialog.service';

@Component({
  selector: 'household-category-list-item',
  templateUrl: './category-list-item.component.html',
  styleUrls: ['./category-list-item.component.scss'],
})
export class CategoryListItemComponent {
  @Input() categories: Category.Response[];
  @Input() category: Category.Response;
  constructor(
    private categoryService: CategoryService,
    private dialogService: DialogService,
    private bottomSheet: MatBottomSheet) { }

  delete() {
    this.dialogService.openDeleteCategoryDialog(this.category).afterClosed()
      .subscribe(shouldDelete => {
        if (shouldDelete) {
          this.categoryService.deleteCategory(this.category.categoryId);
        }
      });
  }

  edit() {
    this.dialogService.openEditCategoryDialog(this.category, this.categories);
  }

  merge() {
    this.dialogService.openMergeCategoriesDialog(this.category, this.categories);
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
