import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Category } from '@household/shared/types/types';
import { Store } from '@ngrx/store';
import { categoryApiActions } from '@household/web/state/category/category.actions';
import { selectMergableCategories } from '@household/web/state/category/category.selector';

export type CategoryMergeDialogData = Category.Id;

@Component({
  selector: 'household-category-merge-dialog',
  templateUrl: './category-merge-dialog.component.html',
  styleUrls: ['./category-merge-dialog.component.scss'],
  standalone: false,
})
export class CategoryMergeDialogComponent implements OnInit {
  form: FormGroup<{
    sourceCategories: FormControl<Category.Id[]>
  }>;

  constructor(private dialogRef: MatDialogRef<CategoryMergeDialogComponent, void>,
    private store: Store,
    @Inject(MAT_DIALOG_DATA) public targetCategoryId: CategoryMergeDialogData) { }

  categories = this.store.select(selectMergableCategories(this.targetCategoryId));

  ngOnInit(): void {
    this.form = new FormGroup({
      sourceCategories: new FormControl(null),
    });
  }

  save() {
    this.store.dispatch(categoryApiActions.mergeCategoriesInitiated({
      sourceCategoryIds: this.form.value.sourceCategories,
      targetCategoryId: this.targetCategoryId,
    }));

    this.dialogRef.close();
  }
}
