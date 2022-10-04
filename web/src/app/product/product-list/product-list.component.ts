import { Component, Input } from '@angular/core';
import { Category } from '@household/shared/types/types';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
})
export class ProductListComponent {
  @Input() categories: Category.Response[];

  constructor() { }

}
