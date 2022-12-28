import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Category } from '@household/shared/types/types';

export type CategoryMergeDialogData = Category.Response[];
export type CategoryMergeDialogResult = Category.IdType[];

@Component({
  selector: 'app-category-merge-dialog',
  templateUrl: './category-merge-dialog.component.html',
  styleUrls: ['./category-merge-dialog.component.scss'],
})
export class CategoryMergeDialogComponent implements OnInit {
  form: FormGroup;

  constructor(private dialogRef: MatDialogRef<CategoryMergeDialogComponent, CategoryMergeDialogResult>,
    @Inject(MAT_DIALOG_DATA) public categories: CategoryMergeDialogData) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      sourceCategories: new FormControl(null),
    });
  }

  save() {
    this.dialogRef.close(this.form.value.sourceCategories);
  }
}
