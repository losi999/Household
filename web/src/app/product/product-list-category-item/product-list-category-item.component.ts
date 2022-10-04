import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Category } from '@household/shared/types/types';
import { ProductFormComponent, ProductFormData, ProductFormResult } from 'src/app/product/product-form/product-form.component';
import { ProductService } from 'src/app/product/product.service';

@Component({
  selector: 'app-product-list-category-item',
  templateUrl: './product-list-category-item.component.html',
  styleUrls: ['./product-list-category-item.component.scss'],
})
export class ProductListCategoryItemComponent {
  @Input() category: Category.Response;
  constructor(private productService: ProductService, private dialog: MatDialog) { }

  newProduct() {
    const dialogRef = this.dialog.open<ProductFormComponent, ProductFormData, ProductFormResult>(ProductFormComponent);

    dialogRef.afterClosed().subscribe({
      next: (values) => {
        if (values) {
          this.productService.createProduct(this.category.categoryId, values);
        }
      },
    });
  }
}
