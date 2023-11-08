import { EndpointConfig } from '../server';

export const account: EndpointConfig[] = [
  {
    regex: '/account/v1/accounts',
    method: 'POST',
    handler: 'create-account',
  },
  {
    regex: '/account/v1/accounts/[^/]+',
    method: 'PUT',
    pathParameters: {
      accountId: 4,
    },
    handler: 'update-account',
  },
  {
    regex: '/account/v1/accounts',
    method: 'GET',
    handler: 'list-accounts',
  },
  {
    regex: '/account/v1/accounts/[^/]+',
    method: 'GET',
    pathParameters: {
      accountId: 4,
    },
    handler: 'get-account',
  },
  {
    regex: '/account/v1/accounts/[^/]+',
    method: 'DELETE',
    pathParameters: {
      accountId: 4,
    },
    handler: 'delete-account',
  },

];

