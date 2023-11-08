import { EndpointConfig } from '../server';

export const project: EndpointConfig[] = [
  {
    regex: '/project/v1/projects',
    method: 'POST',
    handler: 'create-project',
  },
  {
    regex: '/project/v1/projects/[^/]+',
    method: 'PUT',
    pathParameters: {
      projectId: 4,
    },
    handler: 'update-project',
  },
  {
    regex: '/project/v1/projects',
    method: 'GET',
    handler: 'list-projects',
  },
  {
    regex: '/project/v1/projects/[^/]+',
    method: 'GET',
    pathParameters: {
      projectId: 4,
    },
    handler: 'get-project',
  },
  {
    regex: '/project/v1/projects/[^/]+',
    method: 'DELETE',
    pathParameters: {
      projectId: 4,
    },
    handler: 'delete-project',
  },
  {
    regex: '/project/v1/projects/[^/]+/merge',
    method: 'POST',
    pathParameters: {
      projectId: 4,
    },
    handler: 'merge-projects',
  },
];

