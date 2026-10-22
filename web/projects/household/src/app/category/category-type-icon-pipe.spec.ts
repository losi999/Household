import { CategoryTypeIconPipe } from './category-type-icon-pipe';
import { CategoryType } from '@household/shared/enums';
import { testDataFactory } from '@household/shared/common/test-data-factory';

describe('CategoryTypeIconPipe', () => {
  const pipe = new CategoryTypeIconPipe();

  it.each([
    [
      CategoryType.Regular,
      'category',
    ],
    [
      CategoryType.Inventory,
      'inventory_2',
    ],
    [
      CategoryType.Invoice,
      'receipt_long',
    ],
  ])('should return the icon of the %s category type', (categoryType, icon) => {
    expect(pipe.transform(testDataFactory.category.response({
      categoryType,
    }))).toBe(icon);
  });
});
