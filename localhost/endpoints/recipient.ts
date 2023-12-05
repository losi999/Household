import { EndpointConfig } from '../server';

export const recipient: EndpointConfig[] = [
  {
    regex: '/recipient/v1/recipients',
    method: 'POST',
    handler: 'create-recipient',
  },
  {
    regex: '/recipient/v1/recipients/[^/]+',
    method: 'PUT',
    pathParameters: {
      recipientId: 4,
    },
    handler: 'update-recipient',
  },
  {
    regex: '/recipient/v1/recipients',
    method: 'GET',
    handler: 'list-recipients',
  },
  {
    regex: '/recipient/v1/recipients/[^/]+',
    method: 'GET',
    pathParameters: {
      recipientId: 4,
    },
    handler: 'get-recipient',
  },
  {
    regex: '/recipient/v1/recipients/[^/]+',
    method: 'DELETE',
    pathParameters: {
      recipientId: 4,
    },
    handler: 'delete-recipient',
  },
  {
    regex: '/recipient/v1/recipients/[^/]+/merge',
    method: 'POST',
    pathParameters: {
      recipientId: 4,
    },
    handler: 'merge-recipients',
  },
];

