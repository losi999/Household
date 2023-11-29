import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Category } from '@household/shared/types/types';
import { Subject, takeUntil } from 'rxjs';
import { CategoryService } from 'src/app/category/category.service';
import { DialogService } from 'src/app/shared/dialog.service';

@Component({
  selector: 'app-category-home',
  templateUrl: './category-home.component.html',
  styleUrls: ['./category-home.component.scss'],
})
export class CategoryHomeComponent implements OnInit, OnDestroy {
  categories: Category.Response[];
  private destroyed = new Subject();

  constructor(private activatedRoute: ActivatedRoute, private categoryService: CategoryService, private dialogService: DialogService) { }

  ngOnDestroy(): void {
    this.destroyed.next(undefined);
    this.destroyed.complete();
  }

  ngOnInit(): void {
    this.categories = this.activatedRoute.snapshot.data.categories;

    this.categoryService.collectionUpdated.pipe(takeUntil(this.destroyed)).subscribe((event) => {
      switch (event.action) {
        case 'deleted': {
          this.categories = this.categories.filter(p => p.categoryId !== event.categoryId);
        } break;
      }

      this.categoryService.listCategories().subscribe({
        next: (categories) => {
          this.categories = categories;
        },
      });
    });
  }

  create() {
    this.dialogService.openCreateCategoryDialog(this.categories);
  }
}
