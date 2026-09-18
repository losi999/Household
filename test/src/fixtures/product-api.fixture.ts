
import { getCategoryId, getProductId } from '@household/shared/common/utils';
import { headerExpiresIn } from '@household/shared/constants';
import { Api } from '@household/shared/types/api';
import { Requests } from '@household/shared/types/requests';
import { Responses } from '@household/shared/types/responses';
import { Documents } from '@household/shared/types/documents';
import { Comparer } from '@household/test/comparer';
import { test as baseTest } from '@household/test/fixtures/api.fixture';
import { expect as baseExpect, APIResponse } from '@playwright/test';

type ProductApiFixture = {
  requestCreateProduct(product: Requests.Product, categoryId: Api.Category.Id): Promise<APIResponse>;
  requestUpdateProduct(productId: Api.Product.Id, product: Requests.Product): Promise<APIResponse>;
  requestDeleteProduct(productId: Api.Product.Id): Promise<APIResponse>;
  requestMergeProducts(productId: Api.Product.Id, sourceProductIds: Api.Product.Id[]): Promise<APIResponse>;
  requestListProducts(): Promise<APIResponse>;
};

export const test = baseTest.extend<ProductApiFixture>({
  requestCreateProduct: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestCreateProduct = async (product: Requests.Product, categoryId: Api.Category.Id) => {
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

    const requestUpdateProduct = async (productId: Api.Product.Id, product: Requests.Product) => {
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

    const requestDeleteProduct = async (productId: Api.Product.Id) => {
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

    const requestMergeProducts = async (productId: Api.Product.Id, sourceProductIds: Api.Product.Id[]) => {
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

export const validateProductResponse = (response: Responses.Product, document: Documents.Product) => {
  return new Comparer(response, {
    productId: getProductId(document),
    brand: document?.brand,
    measurement: document?.measurement,
    unitOfMeasurement: document?.unitOfMeasurement,
    fullName: document?.fullName,
  });
};

export const expect = baseExpect.extend({
  toHaveBeenSavedAsProductDocument(req: Requests.Product, document: Documents.Product, categoryId: Api.Category.Id) {
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
  toHaveBeenDeletedFromDatabase(document: Documents.Product) {
    return {
      pass: !document,
      message: () => `Expected product to be deleted from database, but it was found with id ${getProductId(document)}`,
    };
  },
  toHaveItsCategoryReassigned(originalDocument: Documents.Product, currentDocument: Documents.Product, expectedCategoryDocument: Documents.Category) {

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
  async toContainMatchingProductDocument(received: APIResponse, document: Documents.Product, categoryId: Api.Category.Id) {
    const response = await received.json() as Responses.ProductGroupedResponse[];
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
