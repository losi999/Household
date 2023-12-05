import { EndpointConfig } from '../server';

export const transaction: EndpointConfig[] = [
  {
    regex: '/transaction/v1/transactions/payment',
    method: 'POST',
    handler: 'create-payment-transaction',
  },
  {
    regex: '/transaction/v1/transactions/split',
    method: 'POST',
    handler: 'create-split-transaction',
  },
  {
    regex: '/transaction/v1/transactions/transfer',
    method: 'POST',
    handler: 'create-transfer-transaction',
  },
  {
    regex: '/transaction/v1/transactions/[^/]+/payment',
    method: 'PUT',
    pathParameters: {
      transactionId: 4,
    },
    handler: 'update-payment-transaction',
  },
  {
    regex: '/transaction/v1/transactions/[^/]+/split',
    method: 'PUT',
    pathParameters: {
      transactionId: 4,
    },
    handler: 'update-split-transaction',
  },
  {
    regex: '/transaction/v1/transactions/[^/]+/transfer',
    method: 'PUT',
    pathParameters: {
      transactionId: 4,
    },
    handler: 'update-transfer-transaction',
  },
  {
    regex: '/transaction/v1/accounts/[^/]+/transactions/[^/]+',
    method: 'GET',
    pathParameters: {
      accountId: 4,
      transactionId: 6,
    },
    handler: 'get-transaction',
  },
  {
    regex: '/transaction/v1/transactions/[^/]+',
    method: 'DELETE',
    pathParameters: {
      transactionId: 4,
    },
    handler: 'delete-transaction',
  },
  {
    regex: '/transaction/v1/accounts/[^/]+/transactions',
    method: 'GET',
    pathParameters: {
      accountId: 4,
    },
    handler: 'list-transactions-by-account',
  },
  {
    regex: '/transaction/v1/transactions',
    method: 'POST',
    handler: 'list-transactions',
  },

];

