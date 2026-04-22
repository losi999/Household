import { productService } from '@household/shared/dependencies/services/product-service';
import { IProductService } from '@household/shared/services/product-service';
import { test as baseTest } from '@household/test/fixtures/logging.fixture';

export const test = baseTest.extend<Pick<IProductService, 'saveProduct' | 'saveProducts' | 'findProductById'>>({
  saveProduct: async ({ logDbCall }, use) => {
    const saveProduct: IProductService['saveProduct'] = async (product) => {
      const result = await productService.saveProduct(product);
      await logDbCall('saveProduct', {
        product,
      }, result);
      return result;
    };

    await use(saveProduct);
  },
  saveProducts: async ({ logDbCall }, use) => {
    const saveProducts: IProductService['saveProducts'] = async (...products) => {
      const result = await productService.saveProducts(...products);
      await logDbCall('saveProducts', {
        products,
      }, result);
      return result;
    };

    await use(saveProducts);
  },
  findProductById: async ({ logDbCall }, use) => {
    const findProductById: IProductService['findProductById'] = async (productId) => {
      const result = await productService.findProductById(productId);
      await logDbCall('findProductById', {
        productId,
      }, result);
      return result;
    };

    await use(findProductById);
  },
});
