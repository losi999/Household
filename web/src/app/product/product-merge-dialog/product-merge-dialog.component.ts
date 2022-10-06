import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Product } from '@household/shared/types/types';

export type ProductMergeDialogData = Product.Response[];
export type ProductMergeDialogResult = Product.IdType[];

@Component({
  selector: 'app-product-merge-dialog',
  templateUrl: './product-merge-dialog.component.html',
  styleUrls: ['./product-merge-dialog.component.scss'],
})
export class ProductMergeDialogComponent implements OnInit {
  form: FormGroup;

  constructor(private dialogRef: MatDialogRef<ProductMergeDialogComponent, ProductMergeDialogResult>,
    @Inject(MAT_DIALOG_DATA) public products: ProductMergeDialogData) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      sourceProducts: new FormControl(null),
    });
  }

  save() {
    this.dialogRef.close(this.form.value.sourceProducts);
  }
}
