import { Component, computed, inject, model } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { ClearableInput } from '@household/shared-ui';
import { search } from '@household/shared/common/utils';
import { Responses } from '@household/shared/types/responses';
import { CategoryStore } from '@household/state/category/category-store';

export type CategorySelectDialogData = {
  excludedCategory?: Responses.Category;
};
export type CategorySelectDialogResult = Responses.Category;

@Component({
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatListModule,
    ClearableInput,
  ],
  styleUrl: './category-select-dialog.scss',
  templateUrl: './category-select-dialog.html',
})
export class CategorySelectDialog {
  private dialogRef = inject<MatDialogRef<CategorySelectDialog, CategorySelectDialogResult>>(MatDialogRef);
  public data = inject<CategorySelectDialogData>(MAT_DIALOG_DATA);
  private categoryStore = inject(CategoryStore);

  searchValue = model<string>('');

  selectableCategories = computed(() => {
    if (!this.data?.excludedCategory && !this.searchValue()) {
      return this.categoryStore.categoryList();
    }

    return this.categoryStore.categoryList().filter((c) => {
      const isItself = c.categoryId === this.data?.excludedCategory?.categoryId;
      const isAChildCategory = c.ancestors.some(a => a.categoryId === this.data?.excludedCategory?.categoryId);

      return !isItself && !isAChildCategory && search(c, this.searchValue());
    });
  });

  onSelect(category: Responses.Category) {
    this.dialogRef.close(category);
  }
}
