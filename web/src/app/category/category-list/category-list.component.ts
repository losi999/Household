import { Component, Input } from '@angular/core';
import { Category } from '@household/shared/types/types';

@Component({
  selector: 'household-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss'],
  standalone: false,
})
export class CategoryListComponent {
  @Input() categories: Category.Response[];

  constructor() { }
}
