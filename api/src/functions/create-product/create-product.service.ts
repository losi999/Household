import { httpErrors } from '@household/api/common/error-handlers';
import { getProductId } from '@household/shared/common/utils';
import { IProductDocumentConverter } from '@household/shared/converters/product-document-converter';
import { ICategoryService } from '@household/shared/services/category-service';
import { IProductService } from '@household/shared/services/product-service';
import { Category, Product } from '@household/shared/types/types';

export interface ICreateProductService {
  (ctx: {
    body: Product.Request;
    expiresIn: number;
  } & Category.Id): Promise<Product.IdType>;
}

export const createProductServiceFactory = (
  productService: IProductService,
  categoryService: ICategoryService,
  productDocumentConverter: IProductDocumentConverter): ICreateProductService => {
  return async ({ body, expiresIn, categoryId }) => {
    const category = await categoryService.getCategoryById(categoryId).catch(httpErrors.category.getById({
      categoryId,
    }));

    httpErrors.category.notFound(!category, {
      categoryId,
    }, 400);

    httpErrors.category.notInventoryType(category);

    const document = productDocumentConverter.create({
      body,
      category,
    }, expiresIn);

    const saved = await productService.saveProduct(document).catch(httpErrors.product.save(document));

    return getProductId(saved);
  };
};
