import { Component, computed, inject, signal } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Api } from '@household/shared/types/api';
import { Responses } from '@household/shared/types/responses';
import { CategoryStore } from '@household/state/category/category-store';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

export type CategoryMergeDialogData = Responses.Category;
export type CategoryMergeDialogResult = {
  targetCategoryId: Api.Category.Id;
  sourceCategoryIds: Api.Category.Id[];
};

@Component({
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatChipsModule,
    MatListModule,
    MatIconModule,
  ],
  styleUrl: './category-merge-dialog.scss',
  templateUrl: './category-merge-dialog.html',
})
export class CategoryMergeDialog {
  private dialogRef = inject<MatDialogRef<CategoryMergeDialog, CategoryMergeDialogResult>>(MatDialogRef);
  public category = inject<CategoryMergeDialogData>(MAT_DIALOG_DATA);
  private categoryStore = inject(CategoryStore);

  selectedCategories = signal<Responses.Category[]>([]);
  selectedCategoryIds = computed(() => {
    return this.selectedCategories().map(p => p.categoryId);
  });

  categories = computed(() => {
    return this.categoryStore.categoryList().filter((p) => {
      const isItself = p.categoryId === this.category.categoryId;
      const isAlreadySelected = this.selectedCategoryIds().includes(p.categoryId); 
      const isSameCategoryType = p.categoryType === this.category.categoryType;
      const isAChildCategory = p.ancestors.some(a => a.categoryId === this.category.categoryId);

      return !isItself && !isAlreadySelected && isSameCategoryType && !isAChildCategory;
    });
  });

  onAddCategory(category: Responses.Category) {
    this.selectedCategories.update((previous) => {
      return [
        ...previous,
        category,
      ];
    });
  }

  onRemoveCategory(category: Responses.Category) {
    this.selectedCategories.update((previous) => {
      return previous.filter(p => p.categoryId !== category.categoryId);
    });
  }

  onSave() { 
    if (this.selectedCategoryIds().length > 0) {
      this.dialogRef.close({
        sourceCategoryIds: this.selectedCategoryIds(),
        targetCategoryId: this.category.categoryId,
      });
    }
  }
}
