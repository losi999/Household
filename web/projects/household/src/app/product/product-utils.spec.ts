import { getParentProductId, hasChildren } from './product-utils';
import { testDataFactory } from '@household/shared/common/test-data-factory';

describe('product utils', () => {
  const generic = testDataFactory.product.response.generic();
  const specific = testDataFactory.product.response.specific({
    genericProductId: generic.productId,
  });
  const variant = testDataFactory.product.response.variant({
    genericProductId: generic.productId,
    specificProductId: specific.productId,
  });
  const otherGeneric = testDataFactory.product.response.generic();
  const otherSpecific = testDataFactory.product.response.specific({
    genericProductId: otherGeneric.productId,
  });

  describe('getParentProductId', () => {
    it('should be undefined for a generic product', () => {
      expect(getParentProductId(generic)).toBeUndefined();
    });

    it('should be the generic product for a specific product', () => {
      expect(getParentProductId(specific)).toBe(generic.productId);
    });

    it('should be the specific product for a variant product', () => {
      expect(getParentProductId(variant)).toBe(specific.productId);
    });
  });

  describe('hasChildren', () => {
    const productList = [
      generic,
      specific,
      variant,
      otherGeneric,
      otherSpecific,
    ];

    it('should be true for a generic product with a specific product', () => {
      expect(hasChildren(productList, generic)).toBe(true);
    });

    it('should be true for a generic product that only has a variant product below its specific products', () => {
      expect(hasChildren([
        generic,
        variant,
      ], generic)).toBe(true);
    });

    it('should be false for a generic product without children', () => {
      expect(hasChildren([otherGeneric], otherGeneric)).toBe(false);
    });

    it('should be true for a specific product with a variant product', () => {
      expect(hasChildren(productList, specific)).toBe(true);
    });

    it('should be false for a specific product without children', () => {
      expect(hasChildren(productList, otherSpecific)).toBe(false);
    });

    it('should be false for a variant product', () => {
      expect(hasChildren(productList, variant)).toBe(false);
    });

    it('should be false if there is no product', () => {
      expect(hasChildren(productList, undefined)).toBe(false);
    });
  });
});
