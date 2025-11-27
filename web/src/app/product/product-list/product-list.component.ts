import { Component, Input } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { Product } from '@household/shared/types/types';
import { ProductListCategoryItemComponent } from '@household/web/app/product/product-list-category-item/product-list-category-item.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@Component({
  selector: 'household-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
  imports: [
    NgxSkeletonLoaderModule,
    MatListModule,
    ProductListCategoryItemComponent,
  ],
})
export class ProductListComponent {
  @Input() groups: Product.GroupedResponse[];

  constructor() { }

}
