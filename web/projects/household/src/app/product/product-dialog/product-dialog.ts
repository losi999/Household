import { Component, computed, inject, signal } from '@angular/core';
import { applyWhen, FormField, form, required } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { getParentProductId, hasChildren } from '@household/app/product/product-utils';
import { ProductSelector } from '@household/app/product/product-selector/product-selector';
import { ClearableInput, exclusiveMin } from '@household/shared-ui';
import { unitsOfMeasurement } from '@household/shared/constants';
import { ProductType } from '@household/shared/enums';
import { Api } from '@household/shared/types/api';
import { Requests } from '@household/shared/types/requests';
import { Responses } from '@household/shared/types/responses';
import { ProductStore } from '@household/state/product/product-store';

export type ProductDialogData = Responses.Product;
export type ProductDialogResult = Requests.Product;

@Component({
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    ClearableInput,
    ProductSelector,
    FormField,
  ],
  styleUrl: './product-dialog.scss',
  templateUrl: './product-dialog.html',
})
export class ProductDialog {
  private dialogRef = inject<MatDialogRef<ProductDialog, ProductDialogResult>>(MatDialogRef);
  public product = inject<ProductDialogData>(MAT_DIALOG_DATA);
  readonly productStore = inject(ProductStore);

  readonly unitsOfMeasurement = unitsOfMeasurement;

  private readonly hasChildren = hasChildren(this.productStore.productList(), this.product);

  // A product with children cannot change its type, so a generic product with children cannot get a parent
  // and a specific product with children cannot lose its parent
  readonly canHaveParent = !(this.product?.productType === ProductType.Generic && this.hasChildren);
  readonly canRemoveParent = !(this.product?.productType === ProductType.Specific && this.hasChildren);

  // The products that can be the parent of this product: variants cannot have children, and a specific product with
  // variants can only be moved to another generic product
  readonly parentProductItems = computed(() => {
    const hasVariants = this.product?.productType === ProductType.Specific && this.productStore.productList().some((p => p.productType === ProductType.Variant && p.specificProductId === this.product.productId));

    return this.productStore.productList().filter((product) => {
      const isVariant = product.productType === ProductType.Variant;
      const isItself = product.productId === this.product?.productId;
      const isAllowedByChildren = !hasVariants || product.productType === ProductType.Generic;

      return !isVariant && !isItself && isAllowedByChildren;
    });
  });

  // The product type is determined by the parent: a product of a generic product is a specific product
  isSpecific = computed(() => {
    return this.productForm.parentProduct().value()?.productType === ProductType.Generic;
  });

  // The parent is null, not undefined, when there is none: a form field with undefined value does not exist
  productModel = signal<Api.Product.Name & Api.Product.Measurement & Api.Product.UnitOfMeasurement & { parentProduct: Responses.Product }>({
    name: this.product?.name ?? '',
    parentProduct: this.findParent() ?? null,
    measurement: this.product?.productType === ProductType.Specific ? this.product.measurement : 0,
    unitOfMeasurement: this.product?.productType === ProductType.Specific ? this.product.unitOfMeasurement : 'db',
  });

  productForm = form(this.productModel, (schemaPath) => {
    required(schemaPath.name, {
      message: 'Kötelező',
    });

    required(schemaPath.parentProduct, {
      message: 'Kötelező',
      when: () => !this.canRemoveParent,
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

  onSave() {
    Object.values(this.productForm).forEach(field => {
      field().markAsTouched();
    });

    if (this.productForm().valid()) {
      const name = this.productForm.name().value();
      const parent = this.productForm.parentProduct().value();

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
