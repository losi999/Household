
import { getCategoryId, getProductId } from '@household/shared/common/utils';
import { Category, Product } from '@household/shared/types/types';
import { createComparer } from '@household/test/utils';
import { expect as baseExpect } from '@playwright/test';

export const expect = baseExpect.extend({
  toHaveBeenDeletedFromDatabase(document: Product.Document) {
    return {
      pass: !document,
      message: () => `expected product to be deleted from database, but it was found with id ${getProductId(document)}`,
    };
  },
  toHaveItsCategoryReassigned(originalDocument: Product.Document, currentDocument: Product.Document, expectedCategoryDocument: Category.Document) {

    const comparer = createComparer((compare) => {
      return {
        brand: compare(currentDocument.brand, originalDocument.brand),
        unitOfMeasurement: compare(currentDocument.unitOfMeasurement, originalDocument.unitOfMeasurement),
        measurement: compare(currentDocument.measurement, originalDocument.measurement),
        fullName: compare(currentDocument.fullName, originalDocument.fullName),
        categoryId: compare(getCategoryId(currentDocument.category), getCategoryId(expectedCategoryDocument)),
      };
    });

    const extraKeys = comparer.extraKeys(currentDocument, [
      '_id',
      'createdAt',
      'expiresAt',
      'updatedAt',
      'category',
    ]);

    if (extraKeys.length > 0) {
      return {
        pass: false,
        message: () => `expected product in database to have no additional properties, but got extra properties: ${extraKeys.join(', ')}`,
      };
    }

    const notMatchingProperties = comparer.notMatchingProperties();

    if (notMatchingProperties.length > 0) {
      return {
        pass: false,
        message: () => `expected product in database to match request, but the following properties did not match: ${notMatchingProperties.join(', ')}`,
      };
    }

    return {
      pass: true,
      message: () => '',
    };
  },
});
