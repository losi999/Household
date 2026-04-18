
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
  async toBeStoredInDatabase(req: Product.Request, document: Product.Document, categoryId: Category.Id) {
    if (!document) {
      return {
        pass: false,
        message: () => 'expected product to be stored in database, but it was not found',
      };
    }

    const comparer = createComparer((compare) => {
      return {
        brand: compare(document.brand, req.brand),
        measurement: compare(document.measurement, req.measurement),
        unitOfMeasurement: compare(document.unitOfMeasurement, req.unitOfMeasurement),
        fullName: compare(document.fullName, `${req.brand} ${req.measurement} ${req.unitOfMeasurement}`),
        categoryId: compare(getCategoryId(document.category), categoryId),
      };  
    });

    const message = comparer.validate(document, '_id', 'createdAt', 'expiresAt', 'updatedAt', 'category');

    return {
      pass: !message,
      message: () => message,
    };
  },
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
  async toMatchProductDocumentInList(received: APIResponse, document: Product.Document, categoryId: Category.Id) {
    const response = await received.json() as Product.GroupedResponse[];
    const categoryResponse = response.find(r => r.categoryId === categoryId);
    const matchingResponse = categoryResponse?.products.find(r => r.productId === getProductId(document));
  
    if (!matchingResponse) {
      return {
        pass: false,
        message: () => `expected response to contain a product with id ${getProductId(document)}, but it was not found`,
      };
    }

    const comparer = createComparer((compare) => {
      return {
        productId: compare(matchingResponse.productId, getProductId(document)),
        brand: compare(matchingResponse.brand, document.brand),
        measurement: compare(matchingResponse.measurement, document.measurement),
        unitOfMeasurement: compare(matchingResponse.unitOfMeasurement, document.unitOfMeasurement),
        fullName: compare(matchingResponse.fullName, document.fullName),
      };
    });

    const message = comparer.validate(matchingResponse);
  
    return {
      pass: !message,
      message: () => message,
    };
  }, 
});
