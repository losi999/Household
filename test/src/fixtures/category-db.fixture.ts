import { ICategoryService } from '@household/shared/services/category-service';
import { categoryServiceFactory } from '@household/shared/services/category-service';
import { mongoDbService } from '@household/test/dependencies';
import { test as baseTest } from '@household/test/fixtures/logging.fixture';

const categoryService = categoryServiceFactory(mongoDbService);

export const test = baseTest.extend<Pick<ICategoryService, 'saveCategory' | 'saveCategories' | 'findCategoryById'>>({
  saveCategory: async ({ logDbCall }, use) => {
    const saveCategory: ICategoryService['saveCategory'] = async (category) => {
      const result = await categoryService.saveCategory(category);
      await logDbCall('saveCategory', {
        category,
      }, result);
      return result;
    };

    await use(saveCategory);
  },
  saveCategories: async ({ logDbCall }, use) => {
    const saveCategories: ICategoryService['saveCategories'] = async (...categories) => {
      const result = await categoryService.saveCategories(...categories);
      await logDbCall('saveCategories', {
        categories,
      }, result);
      return result;
    };

    await use(saveCategories);
  },
  findCategoryById: async ({ logDbCall }, use) => {
    const findCategoryById: ICategoryService['findCategoryById'] = async (categoryId) => {
      const result = await categoryService.findCategoryById(categoryId);
      await logDbCall('findCategoryById', {
        categoryId,
      }, result);
      return result;
    };

    await use(findCategoryById);
  },
});
