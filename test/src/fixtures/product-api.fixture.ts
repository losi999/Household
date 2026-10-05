
import { getProductId } from '@household/shared/common/utils';
import { headerExpiresIn } from '@household/shared/constants';
import { Api } from '@household/shared/types/api';
import { Requests } from '@household/shared/types/requests';
import { Responses } from '@household/shared/types/responses';
import { Documents } from '@household/shared/types/documents';
import { Comparer } from '@household/test/comparer';
import { test as baseTest } from '@household/test/fixtures/api.fixture';
import { expect as baseExpect, APIResponse } from '@playwright/test';
import { ProductType } from '@household/shared/enums';

type ProductApiFixture = {
  requestCreateProduct(product: Requests.Product): Promise<APIResponse>;
  requestUpdateProduct(productId: Api.Product.Id, product: Requests.Product): Promise<APIResponse>;
  requestDeleteProduct(productId: Api.Product.Id): Promise<APIResponse>;
  requestMergeProducts(productId: Api.Product.Id, sourceProductIds: Api.Product.Id[]): Promise<APIResponse>;
  requestListProducts(): Promise<APIResponse>;
};

export const test = baseTest.extend<ProductApiFixture>({
  requestCreateProduct: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestCreateProduct = async (product: Requests.Product) => {
      return loggedRequest.post(`${process.env.BASE_URL}/product/v1/products`, {
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
    name: document?.name,
    productType: document?.productType,
    measurement: document?.productType === ProductType.Specific ? document?.measurement : undefined,
    unitOfMeasurement: document?.productType === ProductType.Specific ? document?.unitOfMeasurement : undefined,
    fullName: document?.productType === ProductType.Specific ? document?.fullName : undefined,
  });
};

export const expect = baseExpect.extend({
  toHaveBeenSavedAsProductDocument(req: Requests.Product, document: Documents.Product, parentProductDocument?: Documents.Product) {
    if (!document) {
      return {
        pass: false,
        message: () => 'expected product to be stored in database, but it was not found',
      };
    }

    const genericProduct = parentProductDocument?.productType === ProductType.Specific ? parentProductDocument.genericProduct : parentProductDocument;
    const specificProduct = parentProductDocument?.productType === ProductType.Specific ? parentProductDocument : undefined;

    const comparer = new Comparer(document, {
      name: req.name,
      productType: req.productType,
      measurement: req.productType === ProductType.Specific ? req.measurement : undefined,
      unitOfMeasurement: req.productType === ProductType.Specific ? req.unitOfMeasurement : undefined,
      fullName: req.productType === ProductType.Specific ? `${req.name} ${req.measurement} ${req.unitOfMeasurement}` : undefined, 
      genericProduct: getProductId(genericProduct),
      specificProduct: getProductId(specificProduct),
       
    }, '_id', 'createdAt', 'expiresAt', 'updatedAt');

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
  toHaveItsGenericProductReassigned(originalDocument: Documents.SpecificProduct | Documents.VariantProduct, currentDocument: Documents.Product, expectedParentProductDocument: Documents.Product) {

    const comparer = new Comparer(currentDocument, {
      productType: originalDocument.productType,
      name: originalDocument.name,
      unitOfMeasurement: originalDocument.productType === ProductType.Specific ? originalDocument.unitOfMeasurement : undefined,
      measurement: originalDocument.productType === ProductType.Specific ? originalDocument.measurement : undefined,
      fullName: originalDocument.productType === ProductType.Specific ? originalDocument.fullName : undefined,
      genericProduct: getProductId(expectedParentProductDocument),
      specificProduct: originalDocument.productType === ProductType.Variant ? getProductId(originalDocument.specificProduct) : undefined,
    }, '_id', 'createdAt', 'expiresAt', 'updatedAt');

    const errors = comparer.validate();

    return {
      pass: !errors.length,
      message: () => `Expected product to have its parent reassigned, but it did not:\n${errors.join('\n')}`,
    };
  },
  toHaveItsSpecificProductReassigned(originalDocument: Documents.VariantProduct, currentDocument: Documents.Product, expectedParentProductDocument: Documents.Product) {

    const comparer = new Comparer(currentDocument, {
      productType: originalDocument.productType,
      name: originalDocument.name,
      genericProduct: getProductId(originalDocument.genericProduct),
      specificProduct: getProductId(expectedParentProductDocument),
    }, '_id', 'createdAt', 'expiresAt', 'updatedAt');

    const errors = comparer.validate();

    return {
      pass: !errors.length,
      message: () => `Expected product to have its parent reassigned, but it did not:\n${errors.join('\n')}`,
    };
  },
  async toContainProductTree(received: APIResponse, tree: {
    product: Documents.GenericProduct;
    children: {
      product: Documents.SpecificProduct;
      children: Documents.VariantProduct[];
    }[]
  }) {
    const response = await received.json() as Responses.ProductTree[];
    const genericResponse = response.find(r => r.productId === getProductId(tree.product));
  
    if (!genericResponse) {
      return {
        pass: false,
        message: () => `Expected response to contain a product tree with id ${getProductId(tree.product)}, but it was not found`,
      };
    }

    const comparer = new Comparer(genericResponse, {
      productId: getProductId(tree.product),
      name: tree.product.name,
      productType: tree.product.productType,
      children: genericResponse.children.map((specificResponse, i1) => {
        const specificDocument = tree.children[i1];

        return new Comparer(specificResponse, {
          name: specificDocument.product.name,
          measurement: specificDocument.product.measurement,
          unitOfMeasurement: specificDocument.product.unitOfMeasurement,
          fullName: specificDocument.product.fullName,
          productType: specificDocument.product.productType,
          productId: getProductId(specificDocument.product),
          children: specificResponse.children.map((variantResponse, i2) => {
            const variantDocument = specificDocument.children[i2];

            return new Comparer(variantResponse, {
              name: variantDocument.name,
              productType: variantDocument.productType,
              productId: getProductId(variantDocument),
            });
          }),
        });
      }),
    });

    const errors = comparer.validate();
  
    return {
      pass: !errors.length,
      message: () => `Expected response to match product document, but it did not:\n${errors.join('\n')}`,
    };
  }, 
});
