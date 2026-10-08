import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { AtLeastOne } from '@household/shared/types/common';
import { Responses } from '@household/shared/types/responses';
import { CategoryStore } from '@household/state/category/category-store';

export type CategorySelectDialogData = {
  selectedCategory?: Responses.Category;
  exclude?: AtLeastOne<{
    self: boolean;
    children: boolean;
  }>
};
export type CategorySelectDialogResult = Responses.Category;

@Component({
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatListModule,
  ],
  styleUrl: './category-select-dialog.scss',
  templateUrl: './category-select-dialog.html',
})
export class CategorySelectDialog {
  private dialogRef = inject<MatDialogRef<CategorySelectDialog, CategorySelectDialogResult>>(MatDialogRef);
  public data = inject<CategorySelectDialogData>(MAT_DIALOG_DATA);
  private categoryStore = inject(CategoryStore);

  selectableCategories = computed(() => {
    if (!this.data.exclude || !this.data.selectedCategory) {
      return this.categoryStore.categoryList();
    }

    return this.categoryStore.categoryList().filter((c) => {
      return (!this.data.exclude.self || c.categoryId !== this.data.selectedCategory.categoryId) && 
      (!this.data.exclude.children || c.ancestors.every(a => a.categoryId !== this.data.selectedCategory.categoryId));
    });
  });

  onSelect(category: Responses.Category) {
    this.dialogRef.close(category);
  }
}
