import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Category } from '@household/shared/types/types';
import { CategoryService } from 'src/app/category/category.service';
import { Store } from 'src/app/store';

export type CategoryMergeDialogData = Category.Id;

@Component({
  selector: 'household-category-merge-dialog',
  templateUrl: './category-merge-dialog.component.html',
  styleUrls: ['./category-merge-dialog.component.scss'],
})
export class CategoryMergeDialogComponent implements OnInit {
  form: FormGroup<{
    sourceCategories: FormControl<Category.Id[]>
  }>;

  constructor(private dialogRef: MatDialogRef<CategoryMergeDialogComponent, void>,
    private categoryService: CategoryService,
    private store: Store,
    @Inject(MAT_DIALOG_DATA) public targetCategoryId: CategoryMergeDialogData) { }

  get categories(): Category.Response[] {
    return this.store.categories.value.filter(c => c.categoryId !== this.targetCategoryId);
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      sourceCategories: new FormControl(null),
    });
  }

  save() {
    this.categoryService.mergeCategories(this.targetCategoryId, this.form.value.sourceCategories);

    this.dialogRef.close();
  }
}
