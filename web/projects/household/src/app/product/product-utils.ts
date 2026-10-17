import { ProductType } from '@household/shared/enums';
import { Api } from '@household/shared/types/api';
import { Responses } from '@household/shared/types/responses';

export const getParentProductId = (product: Responses.Product): Api.Product.Id => {
  switch (product.productType) {
    case ProductType.Specific: {
      return product.genericProductId;
    }
    case ProductType.Variant: {
      return product.specificProductId;
    }
    default: {
      return undefined;
    }
  }
};

export const hasChildren = (productList: Responses.Product[], product: Responses.Product): boolean => {
  switch (product?.productType) {
    case ProductType.Generic: {
      return productList.some(p => p.productType !== ProductType.Generic && p.genericProductId === product.productId);
    }
    case ProductType.Specific: {
      return productList.some(p => p.productType === ProductType.Variant && p.specificProductId === product.productId);
    }
    default: {
      return false;
    }
  }
};
