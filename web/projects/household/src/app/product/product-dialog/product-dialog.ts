import { Component, computed, effect, inject, signal } from '@angular/core';
import { applyWhen, FormField, form, required } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { getProductName } from '@household/app/product/product-name';
import { ClearableInput, exclusiveMin, IconText } from '@household/shared-ui';
import { unitsOfMeasurement } from '@household/shared/constants';
import { ProductType } from '@household/shared/enums';
import { Api } from '@household/shared/types/api';
import { Requests } from '@household/shared/types/requests';
import { productEvents, ProductTreeNode } from '@household/state/product/product-events';
import { ProductStore } from '@household/state/product/product-store';
import { injectDispatch } from '@ngrx/signals/events';

export type ProductDialogData = ProductTreeNode;
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
  readonly getName = getProductName;

  private readonly hasChildren = this.product?.productType !== ProductType.Variant && this.product?.children.length > 0;

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

  parentProduct = signal<ProductTreeNode>(this.findParent());

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

  private findParent(): ProductTreeNode {
    const productList = this.productStore.productList();

    switch (this.product?.productType) {
      case ProductType.Specific: {
        return productList.find(generic => generic.children.some(specific => specific.productId === this.product.productId));
      }
      case ProductType.Variant: {
        return productList.flatMap(generic => generic.children).find(specific => specific.children.some(variant => variant.productId === this.product.productId));
      }
      default: {
        return undefined;
      }
    }
  }

  onEditParent() {
    this.productEvents.selectProduct({
      productToUpdate: this.product,
    });
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
