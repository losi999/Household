import { Api } from '@household/shared/types/api';
import { combine } from '@household/shared/common/schema-utils';
import { ObjectSchema, StrictSchema } from '@household/shared/types/schema';
import { Responses } from '@household/shared/types/responses';
import { Requests } from '@household/shared/types/requests';

export const projectId: ObjectSchema<Api.Project.ProjectId> = {
  type: 'object',
  additionalProperties: false,
  required: ['projectId'],
  properties: {
    projectId: {
      type: 'string',
      pattern: '^[a-zA-Z0-9]{24}$',
    },
  },
};

const name: ObjectSchema<Api.Project.Name> = {
  type: 'object',
  additionalProperties: false,
  required: ['name'],
  properties: {
    name: {
      type: 'string',
      minLength: 1,
    },
  },
};

const description: ObjectSchema<Api.Project.Description> = {
  type: 'object',
  additionalProperties: false,
  required: ['description'],
  properties: {
    description: {
      type: 'string',
      minLength: 1,
    },
  },
};

const base = combine<Api.Project.Base>([
  name,
  description,
], {
  optional: ['description'],
});

export const response = combine<Responses.Project>([
  projectId,
  base,
]);

export const report = combine<Responses.ProjectReport>([
  projectId,
  name,
]);

export const request = combine<Requests.Project>([base]);

export const idList: StrictSchema<Api.Project.Id[]> = {
  type: 'array',
  minItems: 1,
  items: projectId.properties.projectId,
};
