
import { getCategoryId, getProductId } from '@household/shared/common/utils';
import { headerExpiresIn } from '@household/shared/constants';
import { Category, Product } from '@household/shared/types/types';
import { Comparer } from '@household/test/comparer';
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
  requestCreateProduct: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestCreateProduct = async (product: Product.Request, categoryId: Category.Id) => {
      return loggedRequest.post(`${process.env.BASE_URL}/product/v1/categories/${categoryId}/products`, {
        headers: {
          Authorization: authToken,
          [headerExpiresIn]: process.env.EXPIRES_IN,
        },
        data: product,
      });
    };

    await use(requestCreateProduct);
  },
  requestUpdateProduct: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestUpdateProduct = async (productId: Product.Id, product: Product.Request) => {
      return loggedRequest.put(`${process.env.BASE_URL}/product/v1/products/${productId}`, {
        headers: {
          Authorization: authToken,
          [headerExpiresIn]: process.env.EXPIRES_IN,
        },
        data: product,
      });
    };

    await use(requestUpdateProduct);
  },
  requestDeleteProduct: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestDeleteProduct = async (productId: Product.Id) => {
      return loggedRequest.delete(`${process.env.BASE_URL}/product/v1/products/${productId}`, {
        headers: {
          Authorization: authToken,
        },
      });
    };

    await use(requestDeleteProduct);
  },
  requestMergeProducts: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestMergeProducts = async (productId: Product.Id, sourceProductIds: Product.Id[]) => {
      return loggedRequest.post(`${process.env.BASE_URL}/product/v1/products/${productId}/merge`, {
        headers: {
          Authorization: authToken,
        },
        data: sourceProductIds,
      });
    };

    await use(requestMergeProducts);
  },
  requestListProducts: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestListProducts = async () => {
      return loggedRequest.get(`${process.env.BASE_URL}/product/v1/products`, {
        headers: {
          Authorization: authToken,
        },
      });
    };

    await use(requestListProducts);
  },
});

export const validateProductResponse = (response: Product.Response, document: Product.Document) => {
  return new Comparer(response, {
    productId: getProductId(document),
    brand: document?.brand,
    measurement: document?.measurement,
    unitOfMeasurement: document?.unitOfMeasurement,
    fullName: document?.fullName,
  });
};

export const expect = baseExpect.extend({
  toHaveBeenSavedAsProductDocument(req: Product.Request, document: Product.Document, categoryId: Category.Id) {
    if (!document) {
      return {
        pass: false,
        message: () => 'expected product to be stored in database, but it was not found',
      };
    }

    const comparer = new Comparer(document, {
      brand: req.brand,
      measurement: req.measurement,
      unitOfMeasurement: req.unitOfMeasurement,
      fullName: `${req.brand} ${req.measurement} ${req.unitOfMeasurement}`,
      category: categoryId,
    
    }, '_id', 'createdAt', 'expiresAt', 'updatedAt', 'category');

    const errors = comparer.validate();

    return {
      pass: !errors.length,
      message: () => `Expected product to be stored in database, but it was not:\n${errors.join('\n')}`,
    };
  },
  toHaveBeenDeletedFromDatabase(document: Product.Document) {
    return {
      pass: !document,
      message: () => `Expected product to be deleted from database, but it was found with id ${getProductId(document)}`,
    };
  },
  toHaveItsCategoryReassigned(originalDocument: Product.Document, currentDocument: Product.Document, expectedCategoryDocument: Category.Document) {

    const comparer = new Comparer(currentDocument, {
      brand: originalDocument.brand,
      unitOfMeasurement: originalDocument.unitOfMeasurement,
      measurement: originalDocument.measurement,
      fullName: originalDocument.fullName,
      category: getCategoryId(expectedCategoryDocument),
    }, '_id', 'createdAt', 'expiresAt', 'updatedAt');

    const errors = comparer.validate();

    return {
      pass: !errors.length,
      message: () => `Expected product to have its category reassigned, but it did not:\n${errors.join('\n')}`,
    };
  },
  async toContainMatchingProductDocument(received: APIResponse, document: Product.Document, categoryId: Category.Id) {
    const response = await received.json() as Product.GroupedResponse[];
    const categoryResponse = response.find(r => r.categoryId === categoryId);
    const matchingResponse = categoryResponse?.products.find(r => r.productId === getProductId(document));
  
    if (!matchingResponse) {
      return {
        pass: false,
        message: () => `Expected response to contain a product with id ${getProductId(document)}, but it was not found`,
      };
    }

    const comparer = validateProductResponse(matchingResponse, document);

    const errors = comparer.validate();
  
    return {
      pass: !errors.length,
      message: () => `Expected response to match product document, but it did not:\n${errors.join('\n')}`,
    };
  }, 
});
