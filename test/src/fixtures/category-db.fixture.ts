import { categoryService } from '@household/shared/dependencies/services/category-service';
import { ICategoryService } from '@household/shared/services/category-service';
import { test as baseTest } from '@household/test/fixtures/logging.fixture';

export const test = baseTest.extend<Pick<ICategoryService, 'saveCategory' | 'saveCategories' | 'findCategoryById'>>({
  saveCategory: async ({ logServiceCall }, use) => {
    const saveCategory: ICategoryService['saveCategory'] = async (category) => {
      const result = await categoryService.saveCategory(category);
      await logServiceCall('saveCategory', {
        category,
      }, result);
      return result;
    };

    await use(saveCategory);
  },
  saveCategories: async ({ logServiceCall }, use) => {
    const saveCategories: ICategoryService['saveCategories'] = async (...categories) => {
      const result = await categoryService.saveCategories(...categories);
      await logServiceCall('saveCategories', {
        categories,
      }, result);
      return result;
    };

    await use(saveCategories);
  },
  findCategoryById: async ({ logServiceCall }, use) => {
    const findCategoryById: ICategoryService['findCategoryById'] = async (categoryId) => {
      const result = await categoryService.findCategoryById(categoryId);
      await logServiceCall('findCategoryById', {
        categoryId,
      }, result);
      return result;
    };

    await use(findCategoryById);
  },
});
