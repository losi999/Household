import { Component, computed, effect, inject, signal } from '@angular/core';
import { applyWhen, FormField, form, required } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { getParentProductId, hasChildren } from '@household/app/product/product-utils';
import { ClearableInput, exclusiveMin, IconText } from '@household/shared-ui';
import { unitsOfMeasurement } from '@household/shared/constants';
import { ProductType } from '@household/shared/enums';
import { Api } from '@household/shared/types/api';
import { Requests } from '@household/shared/types/requests';
import { Responses } from '@household/shared/types/responses';
import { productEvents } from '@household/state/product/product-events';
import { ProductStore } from '@household/state/product/product-store';
import { injectDispatch } from '@ngrx/signals/events';

export type ProductDialogData = Responses.Product;
export type ProductDialogResult = Requests.Product;

@Component({
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatMenuModule,
    ClearableInput,
    IconText,
    FormField,
  ],
  styleUrl: './product-dialog.scss',
  templateUrl: './product-dialog.html',
})
export class ProductDialog {
  private dialogRef = inject<MatDialogRef<ProductDialog, ProductDialogResult>>(MatDialogRef);
  public product = inject<ProductDialogData>(MAT_DIALOG_DATA);
  private readonly productEvents = injectDispatch(productEvents);
  readonly productStore = inject(ProductStore);

  readonly unitsOfMeasurement = unitsOfMeasurement;

  private readonly hasChildren = hasChildren(this.productStore.productList(), this.product);

  // A product with children cannot change its type, so a generic product with children cannot get a parent
  // and a specific product with children cannot lose its parent
  readonly canHaveParent = !(this.product?.productType === ProductType.Generic && this.hasChildren);
  readonly canRemoveParent = !(this.product?.productType === ProductType.Specific && this.hasChildren);

  constructor() {
    effect(() => {
      if (this.productStore.pendingParentProduct()) {
        this.parentProduct.set(this.productStore.pendingParentProduct());
      }
    });
  }

  parentProduct = signal<Responses.Product>(this.findParent());

  // The product type is determined by the parent: a product of a generic product is a specific product
  isSpecific = computed(() => {
    return this.parentProduct()?.productType === ProductType.Generic;
  });

  productModel = signal<Api.Product.Name & Api.Product.Measurement & Api.Product.UnitOfMeasurement>({
    name: this.product?.name ?? '',
    measurement: this.product?.productType === ProductType.Specific ? this.product.measurement : 0,
    unitOfMeasurement: this.product?.productType === ProductType.Specific ? this.product.unitOfMeasurement : 'db',
  });

  productForm = form(this.productModel, (schemaPath) => {
    required(schemaPath.name, {
      message: 'Kötelező',
    });

    applyWhen(schemaPath, () => this.isSpecific(), (specificPath) => {
      required(specificPath.measurement, {
        message: 'Kötelező',
      });
      exclusiveMin(specificPath.measurement, 0, {
        message: 'A mennyiségnek nagyobbnak kell lennie, mint 0',
      });
      required(specificPath.unitOfMeasurement, {
        message: 'Kötelező',
      });
    });
  });

  private findParent(): Responses.Product {
    const parentProductId = this.product ? getParentProductId(this.product) : undefined;

    return this.productStore.productList().find(p => p.productId === parentProductId);
  }

  onEditParent() {
    const hasVariants = this.product?.productType === ProductType.Specific && this.productStore.productList().some((p => p.productType === ProductType.Variant && p.specificProductId === this.product.productId));
    
    const items = this.productStore.productList().filter((product) => {
      const isVariant = product.productType === ProductType.Variant;
      const isItself = product.productId === this.product?.productId;
      const isAllowedByChildren = !hasVariants || product.productType === ProductType.Generic;

      return !isVariant && !isItself && isAllowedByChildren;
    });
    
    this.productEvents.selectProduct(items);
  }

  onRemoveParent() {
    this.parentProduct.set(undefined);
  }

  onSave() {
    Object.values(this.productForm).forEach(field => {
      field().markAsTouched();
    });

    if (this.productForm().valid()) {
      const name = this.productForm.name().value();
      const parent = this.parentProduct();

      if (!parent) {
        this.dialogRef.close({
          productType: ProductType.Generic,
          name,
        });
      } else if (parent.productType === ProductType.Generic) {
        this.dialogRef.close({
          productType: ProductType.Specific,
          name,
          parentProductId: parent.productId,
          measurement: this.productForm.measurement().value(),
          unitOfMeasurement: this.productForm.unitOfMeasurement().value(),
        });
      } else {
        this.dialogRef.close({
          productType: ProductType.Variant,
          name,
          parentProductId: parent.productId,
        });
      }
    }
  }
}
