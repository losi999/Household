import { Component, effect, inject, signal } from '@angular/core';
import { FormField, form, required } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { ClearableInput, IconText } from '@household/shared-ui';
import { CategoryType } from '@household/shared/enums';
import { Api } from '@household/shared/types/api';
import { Requests } from '@household/shared/types/requests';
import { Responses } from '@household/shared/types/responses';
import { categoryEvents } from '@household/state/category/category-events';
import { CategoryStore } from '@household/state/category/category-store';
import { injectDispatch } from '@ngrx/signals/events';

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
    IconText,
    MatMenuModule,
  ],
  styleUrl: './category-dialog.scss',
  templateUrl: './category-dialog.html',
})
export class CategoryDialog {
  private dialogRef = inject<MatDialogRef<CategoryDialog, CategoryDialogResult>>(MatDialogRef);
  public category = inject<CategoryDialogData>(MAT_DIALOG_DATA);
  private readonly categoryEvents = injectDispatch(categoryEvents);
  readonly categoryStore = inject(CategoryStore);

  constructor () {
    effect(() => {
      if (this.categoryStore.pendingParentCategory()) {
        this.parentCategory.set(this.categoryStore.pendingParentCategory());
      }
    });
  }

  parentCategory = signal(this.category?.parentCategory ?? undefined);

  categoryModel = signal<Api.Category.Name & Api.Category.CategoryType>({
    name: this.category?.name ?? '',
    categoryType: this.category?.categoryType ?? CategoryType.Regular,
  });
  
  categoryForm = form(this.categoryModel, (schemaPath) => {
    required(schemaPath.name, {
      message: 'Kötelező',
    });
  });

  onEditParent() {
    this.categoryEvents.selectCategory({
      selectedCategory: this.category,
      exclude: {
        self: true,
        children: true,
      },
    });
  }

  onRemoveParent() {
    this.parentCategory.set(undefined);
  }

  onSave() {
    Object.values(this.categoryForm).forEach(field => {
      field().markAsTouched();
    });

    if (this.categoryForm().valid()) {
      this.dialogRef.close({
        name: this.categoryForm.name().value(),
        categoryType: this.categoryForm.categoryType().value(),
        parentCategoryId: this.parentCategory()?.categoryId,
      });
    }
  }
}
