import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Category } from '@household/shared/types/types';
import { Subscription } from 'rxjs';
import { CategoryFormComponent, CategoryFormData, CategoryFormResult } from 'src/app/category/category-form/category-form.component';
import { CategoryService } from 'src/app/category/category.service';

@Component({
  selector: 'app-category-home',
  templateUrl: './category-home.component.html',
  styleUrls: ['./category-home.component.scss']
})
export class CategoryHomeComponent implements OnInit, OnDestroy {
  categories: Category.Response[];
  refreshList: Subscription;

  constructor(private activatedRoute: ActivatedRoute, private categoryService: CategoryService, private dialog: MatDialog) { }

  ngOnDestroy(): void {
    this.refreshList.unsubscribe();
  }

  ngOnInit(): void {
    this.categories = this.activatedRoute.snapshot.data.categories;

    this.refreshList = this.categoryService.refreshList.subscribe({
      next: () => {
        this.categoryService.listCategories().subscribe((categories) => {
          this.categories = categories;
        });
      }
    });
  }

  create() {
    const dialogRef = this.dialog.open<CategoryFormComponent, CategoryFormData, CategoryFormResult>(CategoryFormComponent, {
      data: {
        category: undefined,
        categories: this.categories,
      }
    });

    dialogRef.afterClosed().subscribe({
      next: (values) => {
        if (values) {
          this.categoryService.createCategory(values);
        }
      }
    })
  }
}
