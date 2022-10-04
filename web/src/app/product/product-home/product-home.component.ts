import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Category } from '@household/shared/types/types';
import { Subscription } from 'rxjs';
import { CategoryService } from 'src/app/category/category.service';
import { ProductService } from 'src/app/product/product.service';

@Component({
  selector: 'app-product-home',
  templateUrl: './product-home.component.html',
  styleUrls: ['./product-home.component.scss'],
})
export class ProductHomeComponent implements OnInit, OnDestroy {
  categories: Category.Response[];
  refreshList: Subscription;

  constructor(private activatedRoute: ActivatedRoute, private productService: ProductService, private categoryService: CategoryService, private dialog: MatDialog) { }

  ngOnDestroy(): void {
    this.refreshList.unsubscribe();
  }

  ngOnInit(): void {
    this.categories = this.activatedRoute.snapshot.data.categories;

    this.refreshList = this.productService.refreshList.subscribe({
      next: () => {
        this.categoryService.listCategories('inventory').subscribe((categories) => {
          this.categories = categories;
        });
      },
    });
  }
}

