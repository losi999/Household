import { Component, input } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { CategoryListItem } from '@household/app/category/category-list-item/category-list-item';
import { Responses } from '@household/shared/types/responses';

@Component({
  imports: [
    CategoryListItem,
    MatListModule,
  ],
  selector: 'household-category-list',
  styleUrl: './category-list.scss',
  templateUrl: './category-list.html',
})
export class CategoryList {
  categories = input.required<Responses.Category[]>();
}
