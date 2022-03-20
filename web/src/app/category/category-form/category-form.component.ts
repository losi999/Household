import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Category } from '@household/shared/types/types';

export type CategoryFormData = {
  category: Category.Response;
  categories: Category.Response[];
};
export type CategoryFormResult = Category.Request;

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.scss']
})
export class CategoryFormComponent implements OnInit {
  form: FormGroup;
  constructor(private dialogRef: MatDialogRef<CategoryFormComponent, CategoryFormResult>,
    @Inject(MAT_DIALOG_DATA) public data: CategoryFormData) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      name: new FormControl(this.data.category?.name, [Validators.required]),
      parentCategory: new FormControl(this.data.category?.parentCategory ? this.data.categories.find(x => x.categoryId === this.data.category.parentCategory.categoryId) : null),
    })
  }

  save() {
    if (this.form.valid) {
      this.dialogRef.close({
        name: this.form.value.name,
        parentCategoryId: this.form.value.parentCategory?.categoryId,
      });
    }
  }
}
