import { getSpecificProductFullName, getVariantProductFullName, sortProductsByFullName } from '@household/shared/common/utils';
import { testDataFactory } from '@household/shared/common/test-data-factory';

describe('Product utils', () => {
  describe('getSpecificProductFullName', () => {
    it('should join the name of the generic product, the name, the measurement and the unit of measurement', () => {
      expect(getSpecificProductFullName('Tej', {
        name: 'UHT 2,8%',
        measurement: 1,
        unitOfMeasurement: 'l',
      })).toBe('Tej / UHT 2,8% 1 l');
    });
  });

  describe('getVariantProductFullName', () => {
    it('should join the full name of the specific product and the name', () => {
      expect(getVariantProductFullName('Tej / UHT 2,8% 1 l', 'Pilos')).toBe('Tej / UHT 2,8% 1 l / Pilos');
    });
  });

  describe('sortProductsByFullName', () => {
    const generic1 = testDataFactory.product.response.generic({
      name: 'a generic',
      fullName: 'a generic',
    });
    const generic2 = testDataFactory.product.response.generic({
      name: 'b generic',
      fullName: 'b generic',
    });
    const specific1 = testDataFactory.product.response.specific({
      response: {
        name: 'a specific',
        measurement: 2,
        unitOfMeasurement: 'l',
      },
      genericProduct: generic1,
    });
    const specific2 = testDataFactory.product.response.specific({
      response: {
        name: 'a specific',
        measurement: 10,
        unitOfMeasurement: 'l',
      },
      genericProduct: generic1,
    });
    const specific3 = testDataFactory.product.response.specific({
      response: {
        name: 'b specific',
        measurement: 1,
        unitOfMeasurement: 'kg',
      },
      genericProduct: generic2,
    });
    const variant1 = testDataFactory.product.response.variant({
      response: {
        name: 'a variant',
      },
      specificProduct: specific1,
    });

    it('should return nothing for an empty list', () => {
      expect(sortProductsByFullName([])).toEqual([]);
    });

    it('should put every product directly after its parent', () => {
      expect(sortProductsByFullName([
        specific3,
        variant1,
        generic2,
        specific1,
        generic1,
      ])).toEqual([
        generic1,
        specific1,
        variant1,
        generic2,
        specific3,
      ]);
    });

    it('should order the measurements as numbers', () => {
      expect(sortProductsByFullName([
        specific2,
        specific1,
      ])).toEqual([
        specific1,
        specific2,
      ]);
    });

    it('should not change the given list', () => {
      const products = [
        generic2,
        generic1,
      ];

      sortProductsByFullName(products);

      expect(products).toEqual([
        generic2,
        generic1,
      ]);
    });
  });
});
