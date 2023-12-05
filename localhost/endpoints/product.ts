import { EndpointConfig } from '../server';

export const product: EndpointConfig[] = [
  {
    regex: '/product/v1/categories/[^/]+/products',
    method: 'POST',
    pathParameters: {
      categoryId: 4,
    },
    handler: 'create-product',
  },
  {
    regex: '/product/v1/products/[^/]+',
    method: 'PUT',
    pathParameters: {
      productId: 4,
    },
    handler: 'update-product',
  },
  {
    regex: '/product/v1/products/[^/]+/merge',
    method: 'POST',
    pathParameters: {
      productId: 4,
    },
    handler: 'merge-products',
  },
  {
    regex: '/product/v1/products/[^/]+',
    method: 'DELETE',
    pathParameters: {
      productId: 4,
    },
    handler: 'delete-product',
  },

];

