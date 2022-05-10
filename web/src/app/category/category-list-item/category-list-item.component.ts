import { Component, Input } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { Category } from '@household/shared/types/types';
import { CategoryFormComponent, CategoryFormData, CategoryFormResult } from 'src/app/category/category-form/category-form.component';
import { CategoryService } from 'src/app/category/category.service';
import { CatalogSubmenuComponent, CatalogSubmenuData, CatalogSubmenuResult } from 'src/app/shared/catalog-submenu/catalog-submenu.component';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-category-list-item',
  templateUrl: './category-list-item.component.html',
  styleUrls: ['./category-list-item.component.scss'],
})
export class CategoryListItemComponent {
  @Input() categories: Category.Response[];
  @Input() category: Category.Response;
  constructor(
    private categoryService: CategoryService,
    private dialog: MatDialog,
    private bottomSheet: MatBottomSheet) { }

  delete() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Törölni akarod ezt a kategóriát?',
        content: this.category.name,
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.categoryService.deleteCategory(this.category.categoryId);
      }
    });
  }

  edit() {
    const dialogRef = this.dialog.open<CategoryFormComponent, CategoryFormData, CategoryFormResult>(CategoryFormComponent, {
      data: {
        category: this.category,
        categories: this.categories,
      },
    });

    dialogRef.afterClosed().subscribe((values) => {
      if (values) {
        this.categoryService.updateCategory(this.category.categoryId, values);
      }
    });
  }

  showMenu() {
    const bottomSheetRef = this.bottomSheet.open<CatalogSubmenuComponent, CatalogSubmenuData, CatalogSubmenuResult>(CatalogSubmenuComponent, {
      data: this.category.name, 
    });

    bottomSheetRef.afterDismissed().subscribe((result) => {
      switch (result) {
        case 'delete': this.delete(); break;
        case 'edit': this.edit(); break;
      }
    });
  }
}
