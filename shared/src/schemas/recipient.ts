import { Api } from '@household/shared/types/api';
import { combine } from '@household/shared/common/schema-utils';
import { ObjectSchema, StrictSchema } from '@household/shared/types/schema';
import { Responses } from '@household/shared/types/responses';
import { Requests } from '@household/shared/types/requests';

export const recipientId: ObjectSchema<Api.Recipient.RecipientId> = {
  type: 'object',
  additionalProperties: false,
  required: ['recipientId'],
  properties: {
    recipientId: {
      type: 'string',
      pattern: '^[a-f0-9]{24}$',
    },
  },
};

const name: ObjectSchema<Api.Recipient.Name> = {
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

const base = combine<Api.Recipient.Base>([name]);

export const response = combine<Responses.Recipient>([
  recipientId,
  base,
]);

export const report = combine<Responses.RecipientReport>([
  recipientId,
  name,
]);

export const request = combine<Requests.Recipient>([base]);

export const idList: StrictSchema<Api.Recipient.Id[]> = {
  type: 'array',
  minItems: 1,
  items: recipientId.properties.recipientId,
};
