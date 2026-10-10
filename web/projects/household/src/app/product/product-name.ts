import { ProductType } from '@household/shared/enums';
import { ProductTreeNode } from '@household/state/product/product-events';

// Specific products are distinguished by their measurement, so their full name is displayed
export const getProductName = (product: ProductTreeNode): string => {
  return product.productType === ProductType.Specific ? product.fullName : product.name;
};
