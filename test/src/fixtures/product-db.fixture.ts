import { productService } from '@household/shared/dependencies/services/product-service';
import { IProductService } from '@household/shared/services/product-service';
import { test as baseTest } from '@household/test/fixtures/logging.fixture';

export const test = baseTest.extend<Pick<IProductService, 'saveProduct' | 'saveProducts' | 'findProductById'>>({
  saveProduct: async ({ logServiceCall }, use) => {
    const saveProduct: IProductService['saveProduct'] = async (product) => {
      const result = await productService.saveProduct(product);
      await logServiceCall('saveProduct', {
        product,
      }, result);
      return result;
    };

    await use(saveProduct);
  },
  saveProducts: async ({ logServiceCall }, use) => {
    const saveProducts: IProductService['saveProducts'] = async (...products) => {
      const result = await productService.saveProducts(...products);
      await logServiceCall('saveProducts', {
        products,
      }, result);
      return result;
    };

    await use(saveProducts);
  },
  findProductById: async ({ logServiceCall }, use) => {
    const findProductById: IProductService['findProductById'] = async (productId) => {
      const result = await productService.findProductById(productId);
      await logServiceCall('findProductById', {
        productId,
      }, result);
      return result;
    };

    await use(findProductById);
  },
});
