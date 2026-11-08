import { Component, computed, inject, signal } from '@angular/core';
import { FormField, form, required } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { CategorySelector } from '@household/app/category/category-selector/category-selector';
import { ClearableInput } from '@household/shared-ui';
import { CategoryType } from '@household/shared/enums';
import { Api } from '@household/shared/types/api';
import { Requests } from '@household/shared/types/requests';
import { Responses } from '@household/shared/types/responses';
import { CategoryStore } from '@household/state/category/category-store';

export type CategoryDialogData = Responses.Category;
export type CategoryDialogResult = Requests.Category;

@Component({
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    ClearableInput,
    FormField,
    MatButtonToggleModule,
    MatIconModule,
    CategorySelector,
  ],
  styleUrl: './category-dialog.scss',
  templateUrl: './category-dialog.html',
})
export class CategoryDialog {
  private dialogRef = inject<MatDialogRef<CategoryDialog, CategoryDialogResult>>(MatDialogRef);
  public category = inject<CategoryDialogData>(MAT_DIALOG_DATA);
  readonly categoryStore = inject(CategoryStore);

  // The categories that can be the parent of this category: not itself and not any of its children
  readonly parentCategoryItems = computed(() => {
    return this.categoryStore.categoryList().filter((c) => {
      const isItself = c.categoryId === this.category?.categoryId;
      const isAChildCategory = c.ancestors.some(a => a.categoryId === this.category?.categoryId);

      return !isItself && !isAChildCategory;
    });
  });

  // The parent is null, not undefined, when there is none: a form field with undefined value does not exist
  categoryModel = signal<Api.Category.Name & Api.Category.CategoryType & { parentCategory: Responses.CategoryParent }>({
    name: this.category?.name ?? '',
    categoryType: this.category?.categoryType ?? CategoryType.Regular,
    parentCategory: this.category?.parentCategory ?? null,
  });
  
  categoryForm = form(this.categoryModel, (schemaPath) => {
    required(schemaPath.name, {
      message: 'Kötelező',
    });
  });

  onSave() {
    Object.values(this.categoryForm).forEach(field => {
      field().markAsTouched();
    });

    if (this.categoryForm().valid()) {
      this.dialogRef.close({
        name: this.categoryForm.name().value(),
        categoryType: this.categoryForm.categoryType().value(),
        parentCategoryId: this.categoryForm.parentCategory().value()?.categoryId,
      });
    }
  }
}
