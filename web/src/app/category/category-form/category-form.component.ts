import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Category } from '@household/shared/types/types';
import { Store } from '@ngrx/store';
import { categoryApiActions } from '@household/web/state/category/category.actions';
import { selectCategoriesAsParent } from '@household/web/state/category/category.selector';
import { CategoryType } from '@household/shared/enums';

export type CategoryFormData = Category.Response;

@Component({
  selector: 'household-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.scss'],
  standalone: false,
})
export class CategoryFormComponent implements OnInit {
  CategoryType = CategoryType;

  form: FormGroup<{
    name: FormControl<string>;
    categoryType: FormControl<CategoryType>;
    parentCategory: FormControl<Category.ResponseParent>
  }>;
  categories = this.store.select(selectCategoriesAsParent(this.category?.categoryId));

  constructor(private dialogRef: MatDialogRef<CategoryFormComponent, void>,
    private store: Store,
    @Inject(MAT_DIALOG_DATA) public category: CategoryFormData) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      name: new FormControl(this.category?.name, [Validators.required]),
      categoryType: new FormControl(this.category?.categoryType ?? CategoryType.Regular, [Validators.required]),
      parentCategory: new FormControl(this.category?.parentCategory),
    });
  }

  save() {
    if (this.form.valid) {
      const { categoryType, name, parentCategory } = this.form.getRawValue();

      const request: Category.Request = {
        name,
        categoryType,
        parentCategoryId: parentCategory?.categoryId,
      };

      if (this.category) {
        this.store.dispatch(categoryApiActions.updateCategoryInitiated({
          categoryId: this.category.categoryId,
          ...request,
        }));
      } else {
        this.store.dispatch(categoryApiActions.createCategoryInitiated(request));
      }

      this.dialogRef.close();
    }
  }
}
