import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Category } from '@household/shared/types/types';
import { Observable } from 'rxjs';
import { CategoryService } from 'src/app/category/category.service';
import { Store } from 'src/app/store';

export type CategoryFormData = Category.Response;

@Component({
  selector: 'household-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.scss'],
})
export class CategoryFormComponent implements OnInit {
  form: FormGroup<{
    name: FormControl<string>;
    categoryType: FormControl<Category.CategoryType['categoryType']>;
    parentCategory: FormControl<Category.ResponseBase>
  }>;
  get categories(): Observable<Category.Response[]> {
    return this.store.categories.asObservable();
  }
  constructor(private dialogRef: MatDialogRef<CategoryFormComponent, void>,
    private categoryService: CategoryService,
    private store: Store,
    @Inject(MAT_DIALOG_DATA) public category: CategoryFormData) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      name: new FormControl(this.category?.name, [Validators.required]),
      categoryType: new FormControl(this.category?.categoryType ?? 'regular', [Validators.required]),
      parentCategory: new FormControl(this.category?.parentCategory),
    });
  }

  save() {
    if (this.form.valid) {
      const request: Category.Request = {
        name: this.form.value.name,
        categoryType: this.form.value.categoryType,
        parentCategoryId: this.form.value.parentCategory?.categoryId,
      };

      if (this.category) {
        this.categoryService.updateCategory(this.category.categoryId, request);
      } else {
        this.categoryService.createCategory(request);
      }

      this.dialogRef.close();
    }
  }
}
