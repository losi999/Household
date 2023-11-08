import { EndpointConfig } from '../server';

export const category: EndpointConfig[] = [
  {
    regex: '/category/v1/categories',
    method: 'POST',
    handler: 'create-category',
  },
  {
    regex: '/category/v1/categories/[^/]+',
    method: 'PUT',
    pathParameters: {
      categoryId: 4,
    },
    handler: 'update-category',
  },
  {
    regex: '/category/v1/categories',
    method: 'GET',
    handler: 'list-categories',
  },
  {
    regex: '/category/v1/categories/[^/]+',
    method: 'GET',
    pathParameters: {
      categoryId: 4,
    },
    handler: 'get-category',
  },
  {
    regex: '/category/v1/categories/[^/]+',
    method: 'DELETE',
    pathParameters: {
      categoryId: 4,
    },
    handler: 'delete-category',
  },
  {
    regex: '/category/v1/categories/[^/]+/merge',
    method: 'POST',
    pathParameters: {
      categoryId: 4,
    },
    handler: 'merge-categories',
  },

];

