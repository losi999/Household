import { Component, Input } from '@angular/core';
import { Product } from '@household/shared/types/types';

@Component({
  selector: 'household-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
  standalone: false,
})
export class ProductListComponent {
  @Input() groups: Product.GroupedResponse[];

  constructor() { }

}
