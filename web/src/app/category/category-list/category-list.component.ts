import { Component, Input } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { Category } from '@household/shared/types/types';
import { CategoryListItemComponent } from '@household/web/app/category/category-list-item/category-list-item.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@Component({
  selector: 'household-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss'],
  imports: [
    NgxSkeletonLoaderModule,
    MatListModule,
    CategoryListItemComponent,
  ],
})
export class CategoryListComponent {
  @Input() categories: Category.Response[];

  constructor() { }
}
