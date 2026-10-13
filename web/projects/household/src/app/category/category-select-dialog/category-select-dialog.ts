import { Component, computed, inject, model } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { ClearableInput } from '@household/shared-ui';
import { search } from '@household/shared/common/utils';
import { Responses } from '@household/shared/types/responses';
import { Searchable } from '@household/shared/types/common';
import { CategoryStore } from '@household/state/category/category-store';

export type CategorySelectDialogData = Searchable<Responses.Category>[];
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
    const categoryList = this.data ?? this.categoryStore.categoryList();

    if (!this.searchValue()) {
      return categoryList;
    }

    return categoryList.filter((category) => {
      return search(category, this.searchValue());
    });
  });

  onSelect(category: Responses.Category) {
    this.dialogRef.close(category);
  }
}
