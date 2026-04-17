
import { getCategoryId, getProductId } from '@household/shared/common/utils';
import { headerExpiresIn } from '@household/shared/constants';
import { Category, Product } from '@household/shared/types/types';
import { createComparer } from '@household/test/utils';
import { test as baseTest } from '@household/test/fixtures/api.fixture';
import { expect as baseExpect, APIResponse } from '@playwright/test';

type ProductApiFixture = {
  requestCreateProduct(product: Product.Request, categoryId: Category.Id): Promise<APIResponse>;
  requestUpdateProduct(productId: Product.Id, product: Product.Request): Promise<APIResponse>;
  requestDeleteProduct(productId: Product.Id): Promise<APIResponse>;
  requestMergeProducts(productId: Product.Id, sourceProductIds: Product.Id[]): Promise<APIResponse>;
  requestListProducts(): Promise<APIResponse>;
};

export const test = baseTest.extend<ProductApiFixture>({
  requestCreateProduct: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestCreateProduct = async (product: Product.Request, categoryId: Category.Id) => {
      return request.post(`${process.env.BASE_URL}/product/v1/categories/${categoryId}/products`, {
        headers: {
          Authorization: authToken,
          [headerExpiresIn]: process.env.EXPIRES_IN,
        },
        data: product,
      });
    };

    await use(requestCreateProduct);
  },
  requestUpdateProduct: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestUpdateProduct = async (productId: Product.Id, product: Product.Request) => {
      return request.put(`${process.env.BASE_URL}/product/v1/products/${productId}`, {
        headers: {
          Authorization: authToken,
          [headerExpiresIn]: process.env.EXPIRES_IN,
        },
        data: product,
      });
    };

    await use(requestUpdateProduct);
  },
  requestDeleteProduct: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestDeleteProduct = async (productId: Product.Id) => {
      return request.delete(`${process.env.BASE_URL}/product/v1/products/${productId}`, {
        headers: {
          Authorization: authToken,
        },
      });
    };

    await use(requestDeleteProduct);
  },
  requestMergeProducts: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestMergeProducts = async (productId: Product.Id, sourceProductIds: Product.Id[]) => {
      return request.post(`${process.env.BASE_URL}/product/v1/products/${productId}/merge`, {
        headers: {
          Authorization: authToken,
        },
        data: sourceProductIds,
      });
    };

    await use(requestMergeProducts);
  },
  requestListProducts: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestListProducts = async () => {
      return request.get(`${process.env.BASE_URL}/product/v1/products`, {
        headers: {
          Authorization: authToken,
        },
      });
    };

    await use(requestListProducts);
  },
});

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

    const message = comparer.validate(currentDocument, '_id', 'createdAt', 'expiresAt', 'updatedAt', 'category');

    return {
      pass: !message,
      message: () => message,
    };
  },
});
