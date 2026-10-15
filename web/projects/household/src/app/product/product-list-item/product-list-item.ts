import { Component, computed, inject, input } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { hasChildren } from '@household/app/product/product-utils';
import { GenericProductIcon, SpecificProductIcon, VariantProductIcon } from '@household/app/shared/icons';
import { ProductType } from '@household/shared/enums';
import { Responses } from '@household/shared/types/responses';
import { productEvents } from '@household/state/product/product-events';
import { ProductStore } from '@household/state/product/product-store';
import { injectDispatch } from '@ngrx/signals/events';

@Component({
  imports: [
    MatListModule,
    GenericProductIcon,
    SpecificProductIcon,
    VariantProductIcon,
  ],
  selector: 'household-product-list-item',
  styleUrl: './product-list-item.scss',
  templateUrl: './product-list-item.html',
  host: {
    '[class]': 'this.product().productType',
  },
})
export class ProductListItem {
  product = input.required<Responses.Product>();
  private productEvents = injectDispatch(productEvents);
  private readonly productStore = inject(ProductStore);

  measurement = computed(() => {
    const product = this.product();

    return product.productType === ProductType.Specific ? `${product.measurement} ${product.unitOfMeasurement}` : undefined;
  });

  isDisabled = computed(() => {
    return this.productStore.isInProgress().includes(this.product().productId);
  });

  onShowMenu(): void {
    this.productEvents.openProductListItemSubmenu({
      product: this.product(),
      hasChildren: hasChildren(this.productStore.productList(), this.product()),
    });
  }
}
